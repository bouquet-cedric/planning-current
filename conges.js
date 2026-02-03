import { params } from "./params.js";
import { Planning } from "./Planning.class.js";

/**
 * @type {{
 *  start: string,
 *  end?: string,
 *  statut?: Planning.Site | Planning.Absence
 * }[]}
 */
const conges = [
  {
    start: "1 janvier AM",
    end: "2 janvier PM",
  },
  { start: "6 mars PM" },
  { start: "3 avril PM", end: "12 avril PM" },
  { start: "15 mai", statut: Planning.Absence.RTT },
  { start: "18 mai" },
  { start: "16 mai AM", end: "22 mai PM" },
  { start: "13 juillet", statut: Planning.Absence.RTT },
  { start: "8 août AM", end: "16 août PM" },
  { start: "26 octobre PM", end: "30 octobre PM" },
  { start: "9 novembre AM", end: "10 novembre PM" },
  { start: "12 novembre PM" },
  { start: "13 novembre" },
  {
    start: "23 décembre AM",
    end: "24 décembre PM",
    statut: Planning.Absence.RTT,
  },
  { start: "21 décembre AM", end: "27 décembre PM" },
  {
    start: "28 décembre AM",
    end: "31 décembre PM",
    statut: Planning.Absence.RTT_EMPLOYEUR,
  },
];

export function getConges(user) {
  const authorized = [params.N0, params.N1, params.N2];
  return authorized.map((el) => atob(el)).includes(user) ? conges : [];
}
