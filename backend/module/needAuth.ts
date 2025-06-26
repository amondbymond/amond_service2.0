// isAdmin.ts
import { Response, NextFunction } from "express";

export function isAdmin(req: any, res: Response, next: NextFunction) {
  const grade = req.user?.grade;
  if (grade !== "A") {
    return res.status(400).json({ message: "관리자가 아닙니다" });
  }
  next();
}

export function isLogin(req: any, res: Response, next: NextFunction) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(400).json({ message: "로그인이 필요합니다." });
  }
  next();
}
