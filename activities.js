import { params } from "./params.js";
import { Planning } from "./Planning.class.js";

/**
 *
 * @type {{
 * jour: Planning.Day,
 * start: string,
 * end?: string,
 * heure_debut?: string,
 * heure_fin?:string,
 * lieu: string,
 * nom: string,
 * override?: boolean,
 * public?:boolean} []}
 */
const activities = [
  {
    jour: Planning.Day.VENDREDI,
    start: "10 janvier",
    end: "20 juin",
    heure_debut: "17h30",
    heure_fin: "21h",
    lieu: "Libercourt",
    nom: "Ping Pong",
  },
  {
    jour: Planning.Day.MERCREDI,
    start: "5 janvier",
    end: "1 juin",
    heure_debut: "17h",
    heure_fin: "17h30",
    lieu: "Libercourt",
    nom: "Piano",
  },
  {
    jour: Planning.Day.MARDI,
    start: "5 janvier",
    end: "1 juin",
    heure_debut: "18h",
    heure_fin: "19h30",
    lieu: "Oignies",
    nom: "Tir à l'arc",
  },
  {
    jour: Planning.Day.SAMEDI,
    start: "1 janvier",
    end: "20 juin",
    heure_debut: "14h",
    heure_fin: "18h",
    lieu: "Thumeries",
    nom: "Echecs",
  },
  {
    jour: Planning.Day.SAMEDI,
    start: "6 mars",
    heure_debut: "15h45",
    heure_fin: "18h",
    lieu: "Cabinet des Flandres, Lens",
    nom: "Rendez-vous Ophtalmologue",
  },
  {
    start: "8 août",
    end: "16 août",
    lieu: "Dordogne",
    nom: "Vacances avec Ludo",
    override: true,
    public: true,
  },
];

export function getActivities(user) {
  const authorized = [params.N0, params.N1];
  return authorized.map((el) => atob(el)).includes(user)
    ? activities
    : activities.filter((el) => el.public === true);
}
