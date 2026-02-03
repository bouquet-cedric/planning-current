import { passwordPrompt } from "./modale.js";
import { params } from "./params.js";

const dataP = [
  { cp: "U1VCdGMyaGxiMnd1T1VCbWNnPT0=", name: params.N0 },
  { cp: "UzJseVFHNXZkV3Ro", name: params.N1 },
  { cp: "YkhWa2IySnZkVGcw", name: params.N2 },
];

/**
 *
 * @param {string} code
 * @returns {{cp: string;name: string;} | undefined}
 */
function getPersonFromCode(code) {
  return dataP.find((el) => {
    return btoa(btoa(code)) === el.cp;
  });
}

export const authReady = async () => {
  try {
    const k = "Y2xlZl92YWxpZGVl";

    const dataX = localStorage.getItem(atob(k));
    if (!dataX) {
      const data = await passwordPrompt("Password\u00A0:\u00A0");
      return returns(btoa(data));
    }
    return returns(dataX);

    function returns(cq) {
      const user = getPersonFromCode(atob(cq));

      if (!user) {
        document.body.remove();
        localStorage.clear();
        return null;
      }
      if (!localStorage.getItem("user")) {
        localStorage.setItem(atob(k), cq);
        localStorage.setItem("user", user.name);
      }
      return user.name;
    }
  } catch (err) {
    console.log("err", err);
  }
};
