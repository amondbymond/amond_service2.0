import { url } from "@/constant/commonVariable";
import axios, { isAxiosError, Method } from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = url;

export type apiCallType = {
  url: string;
  method: Method;
  body?: any;
  params?: any;
  headers?: any;
};

/* 기본 api Call 뼈대 **/
export const apiCall = async ({
  url,
  method,
  body,
  params,
  headers,
}: apiCallType) => {
  try {
    const response = await axios.request({
      url,
      method,
      data: body,
      params,
      headers,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/** API 통신 에러 */
export const handleAPIError = (e: any, failMessage: string) => {
  if (e && isAxiosError(e) && e?.response?.data?.message) {
    // 로그인이 필요한 경우는 alert 없이 바로 로그인 페이지로 이동
    if (e?.response?.data?.message.includes("로그인")) {
      window.location.href = "/login";
    } else if (e?.response?.data?.message === "관리자가 아닙니다") {
      alert("접근 권한이 없습니다.");
      window.location.href = "/";
    } else {
      alert(`${e.response.data.message}`);
    }
  } else {
    console.error(e);
    alert(`${failMessage}\n${e}`);
    throw e;
  }
};
