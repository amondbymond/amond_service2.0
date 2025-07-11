import express from "express";
const router = express.Router();
import { queryAsync, transDecrypt } from "../module/commonFunction";
import { isAdmin } from "../module/needAuth";
import { itemNumber } from "../module/constant";
import { getDownloadUrl } from "../module/aws";

// ㅇ 유저
// 유저 계정 목록
router.get("/user/getList/:page", isAdmin, async function (req, res) {
  const { page } = req.params;
  const { searchInput, searchField, orderField, order } = req.query;

  let searchSQL = ``;
  if (searchInput) {
    searchSQL = `WHERE ${searchField} LIKE '%${searchInput}%'`;
  }

  // 유저 정보 + 최근 프로젝트 정보 조회 (향후 고도화 등 고려)
  const sql = `SELECT a.id, a.authType, a.email, a.lastLoginAt, a.createdAt, b.name, b.category, b.url, b.reasonList FROM user a
    LEFT JOIN (
      SELECT p.*
      FROM project p
      INNER JOIN (
        SELECT fk_userId, MAX(id) as max_id
        FROM project
        GROUP BY fk_userId
      ) latest ON p.id = latest.max_id
    ) b ON a.id = b.fk_userId
    ${searchSQL}
    ORDER BY ${orderField} ${order}
    LIMIT ${itemNumber.adminUser} OFFSET ${
    itemNumber.adminUser * (parseInt(page, 10) - 1)
  }`;

  try {
    const result = await queryAsync(sql, []);
    if (result.length === 0) {
      res.status(200).json([]);
      return;
    }

    for (let i = 0; i < result.length; i++) {
      result[i].email =
        result[i].authType === "이메일"
          ? await transDecrypt(result[i].email)
          : null;
    }

    res.status(200).send(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: `계정 목록 로드 실패\n${e}` });
  }
});

// 유저 계정 수
router.get("/user/getTotalNum", isAdmin, async function (req, res) {
  const { searchInput, searchField } = req.query;

  let searchSQL = ``;
  if (searchInput) {
    searchSQL = `WHERE ${searchField} LIKE '%${searchInput}%'`;
  }

  const sql = `SELECT COUNT(*) as totalNum FROM user
    ${searchSQL}`;

  try {
    const result = await queryAsync(sql, []);
    res.status(200).json(result[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: `계정 개수 로드 실패\n${e}` });
  }
});

// ㅇ 콤텐츠
// 콘텐츠 목록
router.get("/content/getList/:page", isAdmin, async function (req, res) {
  const { page } = req.params;
  const { searchInput, searchField, orderField, order } = req.query;

  let searchSQL = ``;
  if (searchInput) {
    searchSQL = `WHERE ${searchField} LIKE '%${searchInput}%'`;
  }

  const sql = `SELECT id, postDate, subject, imageUrl, caption, direction FROM content
    ${searchSQL}
    ORDER BY ${orderField} ${order}
    LIMIT ${itemNumber.adminContent} OFFSET ${
    itemNumber.adminContent * (parseInt(page, 10) - 1)
  }`;

  try {
    const result = await queryAsync(sql, []);
    if (result.length === 0) {
      res.status(200).json([]);
      return;
    }

    res.status(200).send(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: `콘텐츠 목록 로드 실패\n${e}` });
  }
});

// 콘텐츠 수
router.get("/content/getTotalNum", isAdmin, async function (req, res) {
  const { searchInput, searchField } = req.query;

  let searchSQL = ``;
  if (searchInput) {
    searchSQL = `WHERE ${searchField} LIKE '%${searchInput}%'`;
  }

  const sql = `SELECT COUNT(*) as totalNum FROM content
    ${searchSQL}`;

  try {
    const result = await queryAsync(sql, []);
    res.status(200).json(result[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: `콘텐츠 개수 로드 실패\n${e}` });
  }
});

// 콘텐츠 이미지 다운로드
router.get("/content/image", isAdmin, async function (req, res) {
  try {
    const { key, fileName } = req.query;
    const url = await getDownloadUrl(key as string, fileName as string);
    res.status(200).json({ url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: `이미지 다운로드 실패\n${e}` });
  }
});

// ㅇ 프롬프트
// 프롬프트 목록
router.get("/prompt/getList", isAdmin, async function (req, res) {
  const sql = `SELECT * FROM aiPrompt`;

  try {
    const result = await queryAsync(sql, []);
    res.status(200).send(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: `프로그램 목록 로드 실패\n${e}` });
  }
});

// 프롬프트 수정
router.put("/prompt/:promptId", isAdmin, async function (req, res) {
  const { promptId } = req.params;
  const { prompt } = req.body;

  const sql = `UPDATE aiPrompt SET prompt = ? WHERE id = ?`;

  try {
    await queryAsync(sql, [prompt, promptId]);
    res.status(200).json({ message: "프롬프트 수정 완료" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: `프롬프트 수정 실패\n${e}` });
  }
});

export default router;
