import { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import axios from 'axios';
import { URL } from 'url';
import OpenAI from 'openai';

// --- CONFIGURATION ---
// IMPORTANT: Replace with your actual API Keys.
// It's highly recommended to use environment variables for this in production.
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'PASTE_YOUR_YOUTUBE_API_KEY_HERE';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'PASTE_YOUR_OPENAI_API_KEY_HERE';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

// --- HELPER FUNCTIONS ---

/**
 * Downloads an image from a URL and converts it to a Base64 string.
 * @param url The URL of the image to fetch.
 * @returns A promise that resolves to a Base64 string.
 */
const imageUrlToBase64 = async (url: string): Promise<string> => {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 10000
        });
        const buffer = Buffer.from(response.data, 'binary');
        const contentType = response.headers['content-type'] || 'image/jpeg';
        return `data:${contentType};base64,${buffer.toString('base64')}`;
    } catch (error) {
        console.error(`Failed to convert image URL to Base64: ${url}`, error);
        // Return an empty string or a placeholder for failed conversions
        return ''; 
    }
};

/**
 * Resolves a relative URL path into a full, absolute URL.
 * @param relativeUrl The relative path (e.g., /img/logo.png).
 * @param baseUrl The base URL of the website (e.g., https://example.com).
 * @returns The absolute URL.
 */
const resolveUrl = (relativeUrl: string, baseUrl: string): string => {
    try {
        return new URL(relativeUrl, baseUrl).href;
    } catch (error) {
        // If the URL is already absolute or invalid, it might throw.
        // We return the original if it's already absolute.
        if (relativeUrl.startsWith('http')) return relativeUrl;
        return '';
    }
};

// --- SCRAPING STRATEGIES ---

/**
 * Handles YouTube channel URLs using the YouTube Data API v3.
 */
const handleYouTube = async (url: string): Promise<string[]> => {
    console.log(`YOUTUBE HANDLER: Processing ${url}`);

    let channelId = '';
    let channelImage: string | null = null;

    const channelMatch = url.match(/channel\/([A-Za-z0-9_-]+)/);
    const userMatch = url.match(/user\/([A-Za-z0-9_-]+)/);
    const handleMatch = url.match(/youtube\.com\/@([A-Za-z0-9._-]+)/);

    // 1. Extract channelId directly if it's a /channel/ URL
    if (channelMatch) {
        channelId = channelMatch[1];
    } 
    // 2. If it's a /user/ URL, convert username to channelId
    else if (userMatch) {
        const username = userMatch[1];
        const userLookupUrl = `https://www.googleapis.com/youtube/v3/channels?part=id,snippet&forUsername=${username}&key=${YOUTUBE_API_KEY}`;
        const lookupRes = await axios.get(userLookupUrl);
        if (!lookupRes.data.items || lookupRes.data.items.length === 0) {
            throw new Error(`No channel found for username: ${username}`);
        }
        channelId = lookupRes.data.items[0].id;
        channelImage = lookupRes.data.items[0].snippet?.thumbnails?.high?.url || null;
    } 
    // 3. If it's a /@handle URL, use forHandle (if needed, requires YouTube handle lookup support)
    else if (handleMatch) {
        const handle = handleMatch[1];
        // NOTE: This part requires a YouTube API search, which may not always return the channel directly
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${handle}&type=channel&key=${YOUTUBE_API_KEY}`;
        const searchRes = await axios.get(searchUrl);
        if (!searchRes.data.items || searchRes.data.items.length === 0) {
            throw new Error(`No channel found for handle: ${handle}`);
        }
        channelId = searchRes.data.items[0].snippet.channelId;
        channelImage = searchRes.data.items[0].snippet?.thumbnails?.high?.url || null;
    } 
    else {
        throw new Error('Could not extract YouTube Channel ID or username from URL.');
    }

    // 4. Now fetch the top 4 most viewed videos
    const videoApiUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${channelId}&part=snippet,id&order=viewCount&maxResults=4&type=video`;
    const videoRes = await axios.get(videoApiUrl);
    const videos = videoRes.data.items;

    const videoThumbs = videos.map((video: any) => video.snippet.thumbnails.high.url);
    if (channelImage) {
        return [channelImage, ...videoThumbs];
    }
    return videoThumbs;
};

/**
 * Handles Instagram URLs using OpenAI's vision model to analyze and extract representative images.
 */
const handleInstagram = async (url: string): Promise<string[]> => {
    console.log(`INSTAGRAM HANDLER: Processing ${url}`);
    
    // Extract username from URL
    const usernameMatch = url.match(/instagram\.com\/([a-zA-Z0-9_.]+)/);
    if (!usernameMatch) {
        throw new Error('Could not extract Instagram username from URL.');
    }
    const username = usernameMatch[1];
    
    console.log(`Analyzing Instagram profile: ${username}`);
    
    // Launch Puppeteer to take a screenshot of the Instagram page
    const browser = await puppeteer.launch({ 
        headless: true, 
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-images',
            '--disable-javascript',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-default-apps'
        ],
        executablePath: process.env.CHROME_BIN || undefined
    });
    
    try {
        const page = await browser.newPage();
        
        // Set a user agent to avoid being blocked
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Navigate to Instagram page
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Wait for images to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Take a screenshot of the page
        const screenshot = await page.screenshot({ 
            type: 'jpeg', 
            quality: 85,
            fullPage: true 
        });
        
        // Convert screenshot to base64
        const base64Screenshot = `data:image/jpeg;base64,${Buffer.from(screenshot).toString('base64')}`;
        
        // Use OpenAI's vision model to analyze the screenshot
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // Use GPT-4 Vision model
            messages: [
                {
                    role: "system",
                    content: "You are a website image analyzer. Extract and return only the URLs of the 5 most visually representative and high-resolution images from Instagram posts. Focus on images that reflect interior design, food presentation (especially gelato), brand identity elements, and atmosphere. Return only image URLs, one per line, no other text."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Visit: ${url}\n\nReturn only the 5 most visually representative and high-resolution images from posts on this account.\n\nDo not include any captions, descriptions, titles, links, or surrounding text.\n\nFocus on images that reflect:\n- Interior design\n- Food presentation (especially gelato)\n- Brand identity elements\n- Atmosphere\n\nReturn only the images. No text at all.`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: base64Screenshot
                            }
                        }
                    ]
                }
            ],
            max_tokens: 500,
            temperature: 0.1
        });
        
        const response = completion.choices[0]?.message?.content || '';
        
        // Extract image URLs from the response
        const imageUrls = response
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.startsWith('http') && (line.includes('.jpg') || line.includes('.jpeg') || line.includes('.png') || line.includes('.webp')))
            .slice(0, 5); // Limit to 5 images
        
        if (imageUrls.length === 0) {
            // Fallback: try to extract images directly from the page
            const directImages = await page.evaluate(() => {
                const images = Array.from(document.querySelectorAll('img'));
                return images
                    .map(img => img.src)
                    .filter(src => src && src.includes('instagram') && !src.includes('avatar'))
                    .slice(0, 5);
            });
            
            return directImages;
        }
        
        return imageUrls;
        
    } catch (error) {
        console.error('Instagram scraping failed:', error);
        
        // Fallback: Return some placeholder URLs or try basic scraping
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
            
            const fallbackImages = await page.evaluate(() => {
                const images = Array.from(document.querySelectorAll('img'));
                return images
                    .map(img => img.src)
                    .filter(src => src && src.includes('instagram') && !src.includes('avatar'))
                    .slice(0, 5);
            });
            
            return fallbackImages;
        } catch (fallbackError) {
            console.error('Fallback scraping also failed:', fallbackError);
            return [];
        }
    } finally {
        await browser.close();
    }
};

/**
 * Handles general websites using Puppeteer for deep scraping.
 */
/**
 * Handles general websites using Puppeteer for deep scraping.
 * Gets 3-5 most important images excluding logos.
 */
/**
 * Handles general websites using Puppeteer for deep scraping.
 * Gets 3-5 most important images excluding logos.
 */
/**
 * Handles general websites using Puppeteer for deep scraping.
 * Gets 3-5 most important images excluding logos.
 */
/**
 * Handles general websites using Puppeteer for deep scraping.
 * Gets 3-5 most important images excluding logos.
 */
/**
 * Handles general websites using Puppeteer for deep scraping.
 * Gets 3-5 most important images excluding logos.
 */
/**
 * Handles general websites using Puppeteer for deep scraping.
 * Gets 3-5 most important images excluding logos.
 */
/**
 * Handles general websites using Puppeteer for deep scraping.
 * Gets 3-5 most important images excluding logos.
 */
/**
 * Handles general websites using Puppeteer for deep scraping.
 * Gets 3-5 most important images excluding logos.
 */
const handleGeneralWebsite = async (url: string): Promise<string[]> => {
    console.log(`PUPPETEER HANDLER: Starting scrape for ${url}`);
    const browser = await puppeteer.launch({ 
        headless: true, 
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-images',
            '--disable-javascript',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-default-apps'
        ],
        executablePath: process.env.CHROME_BIN || undefined
    });
    const page = await browser.newPage();
    
    try {
        // Add wait time for dynamic content loading (like your Python code)
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds like your Python code

        const imageUrls = new Set<string>();
        const logoAndBrandingImages = new Set<string>();

        // 1. Get Open Graph image (high priority)
        let ogImage = '';
        try {
            const ogImageUrl = await page.$eval('meta[property="og:image"]', el => (el as HTMLMetaElement).content);
            if (ogImageUrl) {
                ogImage = resolveUrl(ogImageUrl, url);
                logoAndBrandingImages.add(ogImage);
            }
        } catch (e) { /* ignore if not found */ }

        // 2. Get Favicon
        try {
            const favicon = await page.$eval('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]', el => (el as HTMLLinkElement).href);
            if (favicon) logoAndBrandingImages.add(resolveUrl(favicon, url));
        } catch (e) { /* ignore if not found */ }

        // 3. Get Logo (using same approach as your Python code)
        try {
            const logoSrc = await page.evaluate(() => {
                // Look for images with "logo" in their attributes
                const logoSelectors = [
                    'img[id*="logo"], img[class*="logo"], img[alt*="logo"]',
                    'header img, nav img, .header img, .navbar img, .nav img',
                    '.logo img, #logo img',
                    'img[src*="logo"]'
                ];
                
                for (const selector of logoSelectors) {
                    const logoEl = document.querySelector(selector);
                    if (logoEl) {
                        return (logoEl as HTMLImageElement).src;
                    }
                }
                return null;
            });
            if (logoSrc) logoAndBrandingImages.add(resolveUrl(logoSrc, url));
        } catch (e) { /* ignore if not found */ }

        // 4. Get a wider range of content images (more aggressive approach)
        const allFoundImages = await page.evaluate((baseUrl) => {
            // Helper function inside evaluate to resolve URLs correctly
            const resolve = (relative: string, base: string) => {
                try { 
                    // Handle already absolute URLs
                    if (relative.startsWith('http://') || relative.startsWith('https://')) {
                        return relative;
                    }
                    // Handle protocol-relative URLs
                    if (relative.startsWith('//')) {
                        return 'https:' + relative;
                    }
                    // Handle relative URLs
                    return new URL(relative, base).href; 
                } catch (e) { 
                    console.log('URL resolution failed for:', relative, 'Error:', e);
                    return relative; // Return original if resolution fails
                }
            };

            interface ImageData {
                src: string;
                top: number;
                left: number;
                area: number;
                width: number;
                height: number;
                type: string;
            }

            interface ImageSource {
                src: string;
                width: number;
                height: number;
                type: string;
            }

            const images: ImageData[] = [];
            const seenUrls = new Set<string>();

            // Get ALL images from various sources on the page
            document.querySelectorAll('*').forEach(function(el) {
                const sources: ImageSource[] = [];
                const rect = el.getBoundingClientRect();

                // 1. Standard IMG elements
                if (el.tagName === 'IMG') {
                    const imgEl = el as HTMLImageElement;
                    let src = imgEl.src || 
                               imgEl.getAttribute('data-src') || 
                               imgEl.getAttribute('data-lazy') || 
                               imgEl.getAttribute('data-original') ||
                               imgEl.getAttribute('data-srcset') ||
                               imgEl.getAttribute('srcset') || '';
                    
                    if (src) {
                        // Handle srcset - take the first/largest image
                        const cleanSrc = src.split(',')[0].split(' ')[0].trim();
                        if (cleanSrc) {
                            sources.push({ src: cleanSrc, width: rect.width, height: rect.height, type: 'img' });
                        }
                    }
                }

                // 2. CSS Background images
                const style = window.getComputedStyle(el);
                const bgImage = style.backgroundImage;
                if (bgImage && bgImage !== 'none' && bgImage.includes('url(')) {
                    const matches = bgImage.match(/url\(["']?([^"']*)["']?\)/g);
                    if (matches) {
                        matches.forEach(match => {
                            const bgUrl = match.match(/url\(["']?([^"']*)["']?\)/);
                            if (bgUrl && bgUrl[1] && bgUrl[1].trim()) {
                                sources.push({ src: bgUrl[1].trim(), width: rect.width, height: rect.height, type: 'bg' });
                            }
                        });
                    }
                }

                // 3. SVG elements
                if (el.tagName === 'SVG') {
                    const svgEl = el as SVGElement;
                    // Check for embedded images in SVG
                    const svgImages = svgEl.querySelectorAll('image');
                    svgImages.forEach(svgImg => {
                        const href = svgImg.getAttribute('href') || svgImg.getAttribute('xlink:href');
                        if (href && href.trim()) {
                            sources.push({ src: href.trim(), width: rect.width, height: rect.height, type: 'svg' });
                        }
                    });
                }

                // 4. Picture elements and source tags
                if (el.tagName === 'PICTURE') {
                    const imgInPicture = el.querySelector('img');
                    if (imgInPicture) {
                        const src = imgInPicture.src || imgInPicture.getAttribute('data-src') || '';
                        if (src && src.trim()) sources.push({ src: src.trim(), width: rect.width, height: rect.height, type: 'picture' });
                    }
                    // Also check source elements
                    const sources_elements = el.querySelectorAll('source');
                    sources_elements.forEach(sourceEl => {
                        const srcset = sourceEl.getAttribute('srcset');
                        if (srcset && srcset.trim()) {
                            const cleanSrc = srcset.split(',')[0].split(' ')[0].trim();
                            if (cleanSrc) sources.push({ src: cleanSrc, width: rect.width, height: rect.height, type: 'source' });
                        }
                    });
                }

                // 5. Video posters
                if (el.tagName === 'VIDEO') {
                    const videoEl = el as HTMLVideoElement;
                    const poster = videoEl.poster;
                    if (poster && poster.trim()) {
                        sources.push({ src: poster.trim(), width: rect.width, height: rect.height, type: 'video-poster' });
                    }
                }

                // 6. Check for data attributes that might contain image URLs
                const dataAttrs = ['data-background', 'data-bg', 'data-image', 'data-img', 'data-photo'];
                dataAttrs.forEach(attr => {
                    const value = el.getAttribute(attr);
                    if (value && value.trim() && (value.includes('.jpg') || value.includes('.jpeg') || value.includes('.png') || value.includes('.webp') || value.includes('.gif'))) {
                        sources.push({ src: value.trim(), width: rect.width, height: rect.height, type: 'data-attr' });
                    }
                });

                // 7. Check inline styles for background-image
                const inlineStyle = el.getAttribute('style');
                if (inlineStyle && inlineStyle.includes('background-image')) {
                    const bgMatch = inlineStyle.match(/background-image:\s*url\(["']?([^"']*)["']?\)/);
                    if (bgMatch && bgMatch[1] && bgMatch[1].trim()) {
                        sources.push({ src: bgMatch[1].trim(), width: rect.width, height: rect.height, type: 'inline-bg' });
                    }
                }

                // Process all found sources
                sources.forEach(source => {
                    let { src, width, height, type } = source;
                    
                    // Clean and validate the src before resolving
                    src = src.trim();
                    
                    if (src && 
                        !seenUrls.has(src) && 
                        width > 30 && // Even more permissive size filter
                        height > 30 && 
                        !src.includes('1x1') &&
                        !src.includes('pixel') &&
                        !src.includes('tracking') &&
                        src.length > 5) { // Skip very short URLs
                        
                        const resolvedSrc = resolve(src, baseUrl);
                        
                        if (resolvedSrc && resolvedSrc.trim() && resolvedSrc !== src) {
                            // Only add if resolution actually changed/improved the URL
                            console.log('Resolved:', src, '->', resolvedSrc);
                        }
                        
                        const finalSrc = resolvedSrc || src; // Use resolved or fall back to original
                        
                        if (finalSrc && finalSrc.trim()) {
                            images.push({
                                src: finalSrc.trim(),
                                top: rect.top,
                                left: rect.left,
                                area: width * height,
                                width: width,
                                height: height,
                                type: type
                            });
                            seenUrls.add(src);
                        }
                    }
                });
            });

            // Sort by area (largest first) to get the most prominent images
            images.sort((a, b) => b.area - a.area);

            return images.map(img => ({
                src: img.src,
                area: img.area,
                type: img.type
            })) as Array<{src: string; area: number; type: string}>;
        }, url);

        console.log(`Found ${allFoundImages.length} total images on the page`);

        // Separate logos/branding from content images
        const contentImages: string[] = [];
        const brandingImages: string[] = [];

        allFoundImages.forEach(img => {
            const srcLower = img.src.toLowerCase();
            
            // Check if it's likely a logo or branding element
            if (srcLower.includes('logo') || 
                srcLower.includes('favicon') || 
                srcLower.includes('icon') ||
                img.area < 10000) { // Very small images are likely icons
                brandingImages.push(img.src);
            } else {
                contentImages.push(img.src);
            }
        });

        console.log(`Separated into ${brandingImages.length} branding and ${contentImages.length} content images`);
        
        // Debug: Log the first few content images to see what we're working with
        console.log(`First 3 content images:`, contentImages.slice(0, 3));

        // Take more content images and add them to our collection
        const topContentImages = contentImages.slice(0, 8); // Get up to 8 content images
        console.log(`Taking ${topContentImages.length} top content images`);
        
        // Debug each image being added
        topContentImages.forEach((img, index) => {
            console.log(`Processing content image ${index + 1}: ${img ? img.substring(0, 100) + '...' : 'NULL/EMPTY'}`);
            if (img && img.trim() && img.length > 10 && img.startsWith('http')) {
                imageUrls.add(img);
                console.log(`Added image ${index + 1} to set. Current size: ${imageUrls.size}`);
            } else {
                console.log(`Skipped image ${index + 1} - invalid URL`);
            }
        });

        console.log(`After adding content images, imageUrls.size = ${imageUrls.size}`);
        console.log(`Current imageUrls:`, Array.from(imageUrls).slice(0, 3));

        // If we still don't have many content images, be more permissive
        if (imageUrls.size < 3) {
            console.log("Not enough content images found, being more permissive...");
            
            // Debug: Check what's in allFoundImages
            console.log(`Sample from allFoundImages:`, allFoundImages.slice(0, 3).map(img => ({ 
                src: img.src.substring(0, 50) + '...', 
                area: img.area 
            })));
            
            // Add larger branding images that might actually be content
            const largerBrandingImages = allFoundImages
                .filter(img => {
                    const isLargeEnough = img.area > 50000;
                    const isNotLogo = !img.src.toLowerCase().includes('logo');
                    const isValidUrl = img.src && img.src.trim() && img.src.length > 10 && img.src.startsWith('http');
                    console.log(`Checking fallback image: ${img.src.substring(0, 50)}... - Large: ${isLargeEnough}, NotLogo: ${isNotLogo}, ValidUrl: ${isValidUrl}`);
                    return isLargeEnough && isNotLogo && isValidUrl;
                })
                .slice(0, 5)
                .map(img => img.src);
                
            console.log(`Adding ${largerBrandingImages.length} larger images as fallback`);
            largerBrandingImages.forEach((img, index) => {
                console.log(`Adding fallback image ${index + 1}: ${img.substring(0, 100)}...`);
                imageUrls.add(img);
            });
        }

        // Convert to arrays and combine: branding first, then diverse content images
        const brandingImagesArray = Array.from(logoAndBrandingImages).filter(Boolean);
        const contentImagesArray = Array.from(imageUrls).filter(Boolean);
        
        // Combine them: branding images + content images
        const finalImages = [...brandingImagesArray, ...contentImagesArray].slice(0, 12); // Allow up to 12 total
        
        console.log(`Returning ${brandingImagesArray.length} branding + ${contentImagesArray.length} content = ${finalImages.length} total images for ${url}`);
        return finalImages;
        
    } finally {
        await browser.close();
    }
};

// --- MAIN CONTROLLER ---

/**
 * This is the main function for the /content/scrape-images endpoint.
 */
export const scrapeImagesController = async (req: Request, res: Response) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required.' });
    }

    console.log(`Starting image scraping for URL: ${url}`);
    
    // Temporary debug logging - remove after testing
    console.log('Environment check:', {
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        hasYouTube: !!process.env.YOUTUBE_API_KEY,
        openAILength: process.env.OPENAI_API_KEY?.length || 0,
        youTubeLength: process.env.YOUTUBE_API_KEY?.length || 0
    });

    try {
        // Check if required environment variables are set
        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY is not set');
            return res.status(500).json({ error: 'OpenAI API key is not configured.' });
        }

        if (!process.env.YOUTUBE_API_KEY) {
            console.warn('YOUTUBE_API_KEY is not set - YouTube scraping may fail');
        }

        let imageUrls: string[] = [];
        const lowercasedUrl = url.toLowerCase();

        console.log(`Processing URL type: ${lowercasedUrl.includes('youtube') ? 'YouTube' : lowercasedUrl.includes('instagram') ? 'Instagram' : 'General Website'}`);

        // ✅ Updated: route all YouTube types
        if (lowercasedUrl.includes('youtube.com/channel') ||
            lowercasedUrl.includes('youtube.com/user') ||
            lowercasedUrl.includes('youtube.com/@')) {
            imageUrls = await handleYouTube(url);
        } else if (lowercasedUrl.includes('instagram.com')) {
            imageUrls = await handleInstagram(url);
        } else {
            imageUrls = await handleGeneralWebsite(url);
        }

        console.log(`Found ${imageUrls.length} image URLs`);

        if (imageUrls.length === 0) {
            return res.status(404).json({ error: 'Could not find any suitable images on the provided URL.' });
        }

        console.log('Converting images to base64...');
        const base64Images = await Promise.all(
            imageUrls.map(imageUrlToBase64)
        );

        const successfulImages = base64Images.filter(b64 => b64.length > 0);
        console.log(`Successfully converted ${successfulImages.length} images to base64`);

        res.status(200).json({ images: successfulImages });

    } catch (error) {
        console.error('Scraping failed with detailed error:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            url: url
        });
        
        // Provide more specific error messages
        let errorMessage = 'An error occurred during the scraping process.';
        if (error instanceof Error) {
            if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
                errorMessage = 'Unable to connect to the target website. Please check the URL and try again.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Request timed out. The website may be slow or unavailable.';
            } else if (error.message.includes('puppeteer')) {
                errorMessage = 'Browser automation failed. This may be due to missing system dependencies.';
            }
        }
        
        res.status(500).json({ error: errorMessage });
    }
};