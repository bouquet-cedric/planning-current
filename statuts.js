import { params } from "./params.js";
import { Planning } from "./Planning.class.js";

/**
 * @type {{
 * day?: Planning.Day,
 * start: string,
 * end: string,
 * statut: Planning.Site | Planning.Absence,
 * public?:boolean}[]}
 */
const statuts = [
  {
    day: Planning.Day.LUNDI,
    start: "1 janvier",
    end: "31 décembre",
    statut: Planning.Site.TELETRAVAIL,
  },
  {
    day: Planning.Day.MARDI,
    start: "1 janvier",
    end: "31 décembre",
    statut: Planning.Site.SUR_SITE,
  },
  {
    day: Planning.Day.MERCREDI,
    start: "1 janvier",
    end: "31 décembre",
    statut: Planning.Site.TELETRAVAIL,
  },
  {
    day: Planning.Day.JEUDI,
    start: "1 janvier",
    end: "31 décembre",
    statut: Planning.Site.SUR_SITE,
  },
  {
    day: Planning.Day.VENDREDI,
    start: "1 janvier",
    end: "31 décembre",
    statut: Planning.Site.TELETRAVAIL,
  },
  {
    start: "1 février",
    end: "15 février",
    statut: Planning.Site.TELETRAVAIL,
  },
  {
    start: "12 novembre",
    end: "12 novembre",
    statut: Planning.Site.TELETRAVAIL,
  },
];

export function getStatus(user) {
  const authorized = [params.N0, params.N1];
  return authorized.map((el) => atob(el)).includes(user)
    ? statuts
    : statuts.filter((el) => el.public);
}
