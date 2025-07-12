// Test patterns for the summarization component
const testText = `• 회사의 장점 →[강력한 브랜드 인지도와 혁신적인 제품 디자인]
• 중심 상품은 [[운동을 즐기는 젊은 세대]]→[강력한 브랜드 인지도와 혁신적인 제품 디자인]`;

// Test patterns
const patterns = [
    {
        regex: /•\s*회사의\s*장점\s*→\s*\[([^\]]+)\]/g,
        type: 'company_advantages',
        key: 'company_advantages'
    },
    {
        regex: /•\s*중심\s*상품은\s*\[\[([^\]]+)\]\]→\s*\[([^\]]+)\]/g,
        type: 'core_product_description_brackets',
        key: 'core_product_description_brackets'
    }
];

console.log('Testing patterns with text:', testText);
console.log('---');

patterns.forEach((pattern, index) => {
    console.log(`Pattern ${index + 1}: ${pattern.type}`);
    console.log(`Regex: ${pattern.regex}`);
    
    let match;
    const matches = [];
    while ((match = pattern.regex.exec(testText)) !== null) {
        matches.push({
            fullMatch: match[0],
            groups: match.slice(1),
            index: match.index
        });
    }
    
    console.log('Matches:', matches);
    console.log('---');
}); 