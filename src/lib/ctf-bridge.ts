// --- Easy-mode bridge: the CTF panel lives at the bottom of the page, the
// stations/demos live at the top, so they talk via window events + localStorage.
// Hard mode never touches this — its codes stay in Network responses only.
export const EASY_MODE_KEY = "muneeb-ctf-mode";
export const EASY_STAGE_KEY = "muneeb-ctf-stage-easy";
export const EASY_CODE_EVENT = "muneeb-ctf-easy-code";
export const EASY_PEEK_EVENT = "muneeb-ctf-easy-peek";
export const EASY_STAGE_EVENT = "muneeb-ctf-easy-stage";
export const EASY_GOTO_EVENT = "muneeb-ctf-goto";
export const easyModeOn = () => { try { return localStorage.getItem(EASY_MODE_KEY) === "easy"; } catch { return false; } };
export const easyStageNow = () => { try { return Number(localStorage.getItem(EASY_STAGE_KEY) || 1); } catch { return 1; } };
export const emitEasyCode = (stage: number, code: string) => { window.dispatchEvent(new CustomEvent(EASY_CODE_EVENT, { detail: { stage, code } })); };
export const goToStation = (id: string) => { window.dispatchEvent(new CustomEvent(EASY_GOTO_EVENT, { detail: { id } })); };
