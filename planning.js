import { getActivities } from "./activities.js";
import { getConges } from "./conges.js";
import { authReady } from "./data.mini.js";
import { Planning } from "./Planning.class.js";
import { getStatus } from "./statuts.js";

const authUser = await authReady();
const user = authUser ? atob(authUser) : authUser;
if (!user) {
  window.location.reload();
}

const date = new Date();
const year = date.getFullYear();
document.title += " " + year;
const h1 = document.getElementsByTagName("h1").item(0);
h1.textContent += " " + year;
h1.classList.add("title");

const spanUser = document.getElementById("name_user");
spanUser.textContent = `Bonjour ${user} !`;
const unconnect = document.getElementById("unconnect");
unconnect.addEventListener("click", () => {
  document.body.remove();
  localStorage.clear();
  window.location.reload();
});
const planning = new Planning(date);

const conges = getConges(user);
conges.forEach((el) => {
  el.statut = el.statut ?? Planning.Absence.CONGES;
  const momentStart = Planning.Momentum.getMomentumFromDay(el.start);
  if (el.end) {
    const momentEnd = Planning.Momentum.getMomentumFromDay(el.end);
    planning.addPeriode(momentStart, momentEnd, el.statut);
  } else {
    if (momentStart.moment === "PM") {
      planning.addJournee(momentStart, null, el.statut);
    } else if (momentStart.moment === "AM") {
      planning.addJournee(momentStart, el.statut);
    } else {
      momentStart.moment = null;
      planning.addJournee(momentStart, el.statut);
    }
  }
});

const statuts = getStatus(user);

statuts.forEach((el) => {
  const momentumStart = Planning.Momentum.getMomentumFromDay(el.start);
  const momentumEnd = Planning.Momentum.getMomentumFromDay(el.end);
  if (el.day) {
    planning.repeatStatut(el.day, momentumStart, momentumEnd, el.statut);
  } else {
    planning.addPeriode(momentumStart, momentumEnd, el.statut);
  }
});

const activities = getActivities(user);
activities.forEach((el) => {
  const momentumStart = Planning.Momentum.getMomentumFromDay(el.start);
  const activity = new Planning.Activity(
    el.heure_debut,
    el.heure_fin,
    el.lieu,
    el.nom,
  );
  if (el.end) {
    const momentumEnd = Planning.Momentum.getMomentumFromDay(el.end);
    planning.repeatActivity(
      el.jour,
      momentumStart,
      momentumEnd,
      activity,
      el.override,
    );
  } else {
    planning.addActivity(momentumStart, activity, el.override);
  }
});

planning.load(document.body);
