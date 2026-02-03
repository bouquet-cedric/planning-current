// Enumérations

const Absence = Object.freeze({
  CONGES: "Congés",
  SANS_SOLDE: "Sans solde",
  RTT: "Rtt",
  RTT_EMPLOYEUR: "Rtt Employeur",
  MALADE: "Malade",
  FERIE: "Férié",
  WEEK_END: "Week-end",
});

const Site = Object.freeze({
  SUR_SITE: "Sur site",
  TELETRAVAIL: "Télétravail",
});

const MoisFR = Object.freeze({
  JANVIER: "Janvier",
  FEVRIER: "Février",
  MARS: "Mars",
  AVRIL: "Avril",
  MAI: "Mai",
  JUIN: "Juin",
  JUILLET: "Juillet",
  AOUT: "Août",
  SEPTEMBRE: "Septembre",
  OCTOBRE: "Octobre",
  NOVEMBRE: "Novembre",
  DECEMBRE: "Décembre",
});

const Day = Object.freeze({
  LUNDI: "lundi",
  MARDI: "mardi",
  MERCREDI: "mercredi",
  JEUDI: "jeudi",
  VENDREDI: "vendredi",
  SAMEDI: "samedi",
  DIMANCHE: "dimanche",
});

// Classes

class Utils {
  /**
   *
   * @param {number} year
   */
  static isBissextile(year) {
    return year % 4 === 0 || (year % 100 === 0 && year % 400 === 0);
  }
  /**
   *
   * @param {number} year
   * @returns {Date}
   */
  static getEasterDate(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);

    const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = mars, 4 = avril
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(year, month - 1, day);
  }

  /**
   *
   * @param {Date} date
   * @param {number} nbJours
   * @returns
   */
  static getDate(date, nbJours) {
    return new Date(date.getTime() + nbJours * 1000 * 60 * 60 * 24);
  }
}

class Jour {
  /**
   *
   * @param {string} nom
   * @param {Absence | Site} matin
   * @param {Absence | Site} apres_midi
   */
  constructor(nom, matin, apres_midi) {
    this.nom = nom;
    this.matin = matin;
    this.apres_midi = apres_midi;
    /**
     * @type {Activity[]}
     */
    this.activities = [];
  }

  /**
   *
   * @param {Activity} activity
   */
  addActivity(activity) {
    this.activities.push(activity);
  }
}

class Activity {
  /**
   *
   * @param {string} heure_debut
   * @param {string} heure_fin
   * @param {string} lieu
   * @param {string} nom
   */
  constructor(heure_debut, heure_fin, lieu, nom) {
    this.heure_debut = heure_debut;
    this.heure_fin = heure_fin;
    this.lieu = lieu;
    this.nom = nom;
  }
}

class Momentum {
  /**
   *
   * @param {number} jour
   * @param {MoisFR} mois
   * @param {'AM' | 'PM' | null} moment
   */
  constructor(jour, mois, moment = null) {
    this.jour = jour;
    this.mois = mois;
    this.moment = moment;
  }

  /**
   *
   * @param {string} jour
   */
  static getMomentumFromDay(jour) {
    const jourTab = jour.split(" ");
    const numStart = parseInt(jourTab[0]);
    const month = jourTab[1][0].toUpperCase() + jourTab[1].substring(1);
    const mois = Object.values(MoisFR).find((el) => el === month);
    if (!mois) {
      throw new Error(`Le mois demandé (${month}) n'existe pas`);
    }
    if (jourTab.length === 3) {
      const moment = jourTab[2];
      if (!["AM", "PM"].includes(moment)) {
        throw new Error(`Le moment demandé (${moment}) n'existe pas`);
      }
      return new Momentum(numStart, mois, moment);
    }
    return new Momentum(numStart, mois);
  }
}

export class Planning {
  /**
   * compte le nombre de load fait
   */
  #nbLoad = 0;

  /**
   *
   * @param {Date} date
   */
  constructor(date) {
    this.date = date;
    this.year = date.getFullYear();
    /**
     * @type {{name: MoisFR, nbJours: number, days: Jour[]}[]}
     */
    this.mois = [
      { name: MoisFR.JANVIER, nbJours: 31, days: [] },
      {
        name: MoisFR.FEVRIER,
        nbJours: Utils.isBissextile(this.year) ? 29 : 28,
        days: [],
      },
      { name: MoisFR.MARS, nbJours: 31, days: [] },
      { name: MoisFR.AVRIL, nbJours: 30, days: [] },
      { name: MoisFR.MAI, nbJours: 31, days: [] },
      { name: MoisFR.JUIN, nbJours: 30, days: [] },
      { name: MoisFR.JUILLET, nbJours: 31, days: [] },
      { name: MoisFR.AOUT, nbJours: 31, days: [] },
      { name: MoisFR.SEPTEMBRE, nbJours: 30, days: [] },
      { name: MoisFR.OCTOBRE, nbJours: 31, days: [] },
      { name: MoisFR.NOVEMBRE, nbJours: 30, days: [] },
      { name: MoisFR.DECEMBRE, nbJours: 31, days: [] },
    ];

    this.mois.forEach((el, index) => {
      for (let i = 0; i < el.nbJours; i++) {
        const date = new Date(this.year, index, i + 1);
        const dayFR = date.toLocaleDateString("fr-FR", {
          weekday: "long",
        });

        const weekEnd = [Day.SAMEDI, Day.DIMANCHE];
        el.days[i] = new Jour(dayFR, null, null);
        if (weekEnd.includes(dayFR)) {
          this.#addStatut(new Momentum(i + 1, el.name), Absence.WEEK_END);
        }
      }
    });

    /**
     * @type {{day: number, month: MoisFR}[]}
     */
    const feries = [
      { day: 1, month: MoisFR.JANVIER },
      { day: 1, month: MoisFR.MAI },
      { day: 8, month: MoisFR.MAI },
      { day: 14, month: MoisFR.JUILLET },
      { day: 15, month: MoisFR.AOUT },
      { day: 1, month: MoisFR.NOVEMBRE },
      { day: 11, month: MoisFR.NOVEMBRE },
      { day: 25, month: MoisFR.DECEMBRE },
    ];

    const paques = Utils.getEasterDate(this.year);
    const lundiPaques = Utils.getDate(paques, 1);
    const ascension = Utils.getDate(paques, 39);
    const lundiPentecote = Utils.getDate(paques, 50);
    const feriesGlissants = [paques, lundiPaques, ascension, lundiPentecote];
    feriesGlissants.forEach((el) => {
      feries.push({ day: el.getDate(), month: this.mois[el.getMonth()].name });
    });

    feries.forEach((ferie) => {
      const mois = this.mois.find((el) => el.name === ferie.month);
      this.#addStatut(new Momentum(ferie.day, mois.name), Absence.FERIE);
    });
  }

  /**
   *
   * @param {Momentum} momentum moment de la journée
   * @param {Absence | Site} statut
   * @private
   */
  #addStatut(momentum, statut) {
    const day = this.mois.find((el) => el.name === momentum.mois).days[
      momentum.jour - 1
    ];
    const exception = [
      Absence.WEEK_END,
      Absence.FERIE,
      Absence.CONGES,
      Absence.RTT,
      Absence.RTT_EMPLOYEUR,
    ];
    const overrideException = [Absence.WEEK_END, Absence.FERIE];

    const canOverride = overrideException.includes(statut);

    const shouldUpdate = (value) =>
      !value || !exception.includes(value) || canOverride;

    if (momentum.moment !== "PM" && shouldUpdate(day.matin)) {
      day.matin = statut;
    }

    if (momentum.moment !== "AM" && shouldUpdate(day.apres_midi)) {
      day.apres_midi = statut;
    }
  }

  /**
   *
   * @param {Momentum} momentum
   * @param {Absence | Site} statut1
   * @param {Absence | Site} statut2
   */
  addJournee(momentum, statut1, statut2 = null) {
    if (statut1 !== null && (statut2 === null || statut1 === statut2)) {
      this.#addStatut(momentum, statut1);
    } else if (statut2 !== null && statut1 === null) {
      this.#addStatut(momentum, statut2);
    } else {
      this.#addStatut(
        new Momentum(momentum.jour, momentum.mois, "AM"),
        statut1,
      );
      this.#addStatut(
        new Momentum(momentum.jour, momentum.mois, "PM"),
        statut2,
      );
    }
  }

  /**
   *
   * @param {Momentum} momentumStart
   * @param {Momentum} momentumEnd
   * @param {Absence | Site} statut
   *
   */
  addPeriode(momentumStart, momentumEnd, statut) {
    if (momentumStart.mois === momentumEnd.mois) {
      if (momentumStart.moment === "AM") {
        this.#addStatut(
          new Momentum(momentumStart.jour, momentumStart.mois),
          statut,
        );
      } else {
        this.#addStatut(
          new Momentum(momentumStart.jour, momentumStart.mois, "PM"),
          statut,
        );
      }

      for (let i = momentumStart.jour + 1; i < momentumEnd.jour; i++) {
        this.#addStatut(new Momentum(i, momentumStart.mois), statut);
      }
      if (momentumEnd.moment === "PM") {
        this.#addStatut(
          new Momentum(momentumEnd.jour, momentumStart.mois),
          statut,
        );
      } else {
        this.#addStatut(
          new Momentum(momentumEnd.jour, momentumStart.mois, "AM"),
          statut,
        );
      }
    } else {
      const startMonthIndex = this.mois.findIndex(
        (el) => el.name === momentumStart.mois,
      );
      const startMonth = this.mois[startMonthIndex];
      const endMonthIndex = this.mois.findIndex(
        (el) => el.name === momentumEnd.mois,
      );

      // Gestion du premier jour en fonction du moment
      if (momentumStart.moment === "AM") {
        this.#addStatut(
          new Momentum(momentumStart.jour, momentumStart.mois),
          statut,
        );
      } else {
        this.#addStatut(
          new Momentum(
            momentumStart.jour,
            momentumStart.mois,
            momentumStart.moment,
          ),
          statut,
        );
      }

      // Rajouter tous les jours du premier mois donné
      for (let i = momentumStart.jour + 1; i <= startMonth.nbJours; i++) {
        this.#addStatut(new Momentum(i, momentumStart.mois), statut);
      }

      // Rajouter tous les jours de tous les inter-mois
      for (let j = startMonthIndex + 1; j < endMonthIndex; j++) {
        const mois = this.mois[j];
        for (let k = 1; k <= mois.nbJours; k++) {
          this.#addStatut(new Momentum(k, mois.name), statut);
        }
      }

      // Rajouter tous les jours du dernier mois donné
      for (let i = 1; i < momentumEnd.jour; i++) {
        this.#addStatut(new Momentum(i, momentumEnd.mois), statut);
      }

      // Gestion du dernier jour en fonction du moment
      if (momentumEnd.moment === "PM") {
        this.#addStatut(
          new Momentum(momentumEnd.jour, momentumEnd.mois),
          statut,
        );
      } else {
        this.#addStatut(
          new Momentum(momentumEnd.jour, momentumEnd.mois, momentumEnd.moment),
          statut,
        );
      }
    }
  }

  /**
   *
   * @param {Momentum} momentum
   * @param {Activity} activity
   */
  addActivity(momentum, activity, overrideException = false) {
    const month = this.mois.find((el) => el.name === momentum.mois);
    const exception = [
      Absence.CONGES,
      Absence.FERIE,
      Absence.RTT,
      Absence.RTT_EMPLOYEUR,
    ];
    const jour = month.days[momentum.jour - 1];

    if (
      exception.includes(jour.matin) &&
      !overrideException &&
      (momentum.moment === null || momentum.moment === "AM")
    ) {
      return;
    } else if (
      exception.includes(jour.apres_midi) &&
      !overrideException &&
      (momentum.moment === null || momentum.moment === "PM")
    ) {
      return;
    }
    jour.addActivity(activity);
  }

  /**
   *
   * @param {string} jour nom en français du jour de la semaine
   * @param {Momentum} momentumStart
   * @param {Momentum} momentumEnd
   * @param {Activity} activity
   */
  repeatActivity(
    jour,
    momentumStart,
    momentumEnd,
    activity,
    overrideException = false,
  ) {
    const indexStartMois = this.mois.findIndex(
      (el) => el.name === momentumStart.mois,
    );
    const indexEndMois = this.mois.findIndex(
      (el) => el.name === momentumEnd.mois,
    );
    this.mois
      .filter((_, index) => index >= indexStartMois && index <= indexEndMois)
      .forEach((el) => {
        el.days.forEach((day, index) => {
          if (
            el.name === momentumStart.mois &&
            index + 1 < momentumStart.jour
          ) {
            return;
          }
          if (el.name === momentumEnd.mois && index + 1 > momentumEnd.jour) {
            return;
          }
          if (!jour || day.nom === jour) {
            this.addActivity(
              new Momentum(index + 1, el.name),
              activity,
              overrideException,
            );
          }
        });
      });
  }

  /**
   *
   * @param {Planning.Day} jour nom en français du jour de la semaine
   * @param {Momentum} momentumStart
   * @param {Momentum} momentumEnd
   * @param {Absence | Site} statut
   */
  repeatStatut(jour, momentumStart, momentumEnd, statut) {
    const indexStartMois = this.mois.findIndex(
      (el) => el.name === momentumStart.mois,
    );
    const indexEndMois = this.mois.findIndex(
      (el) => el.name === momentumEnd.mois,
    );
    this.mois
      .filter((_, index) => index >= indexStartMois && index <= indexEndMois)
      .forEach((el) => {
        el.days.forEach((day, index) => {
          if (
            el.name === momentumStart.mois &&
            index + 1 < momentumStart.jour
          ) {
            return;
          }
          if (el.name === momentumEnd.mois && index + 1 > momentumEnd.jour) {
            return;
          }
          if (day.nom === jour) {
            this.#addStatut(new Momentum(index + 1, el.name), statut);
          }
        });
      });
  }

  /**
   * Récupère le nombre de jour dont les motifs sont déclarés
   * @param {string[]} motif liste des motifs d'absence ou de présence
   * @returns {{stat:number, days: string[]}} Nombre de jours qui correspondent
   */
  getData(...motif) {
    return this.mois.reduce(
      (prev, curr) => {
        const mois = curr.name;
        const nbDays = curr.days.reduce(
          (prev, day, index) => {
            let result = 0;
            if (motif.includes(day.matin)) {
              result += 0.5;
            }
            if (motif.includes(day.apres_midi)) {
              result += 0.5;
            }
            const matin = this.#getClassPerStatut(day.matin);
            const apres_midi = this.#getClassPerStatut(day.apres_midi);
            const sAM = matin.icon;
            const sPM = apres_midi.icon;
            const statut = day.matin === day.apres_midi ? sAM : `${sAM}/${sPM}`;

            const resultDay = `${day.nom} ${index + 1} ${mois} - ${statut}`;

            return {
              stat: prev.stat + result,
              days: result > 0 ? [...prev.days, resultDay] : [...prev.days],
            };
          },
          { stat: 0, days: [] },
        );

        return {
          stat: prev.stat + nbDays.stat,
          days: [...prev.days, ...nbDays.days],
        };
      },
      { stat: 0, days: [] },
    );
  }

  addCount() {
    const entriesAbsence = Object.entries(Absence);
    const entriesSite = Object.entries(Site);
    const entries = [...entriesAbsence, ...entriesSite]
      .filter(([_, value]) => this.getData(value).stat > 0)
      .sort((a, b) => a[1].localeCompare(b[1]));
    const select = document.createElement("select");
    const buttonValidation = document.createElement("button");
    const divButtons = document.createElement("div");
    buttonValidation.type = "submit";
    buttonValidation.id = "submit";
    buttonValidation.textContent = "Compter";
    buttonValidation.style.display = "none";
    buttonValidation.classList.add("count", "valid");
    const buttonReset = document.createElement("button");
    buttonReset.type = "reset";
    buttonReset.id = "reset";
    buttonReset.textContent = "Effacer";
    buttonReset.style.display = "none";
    buttonReset.classList.add("count", "reset");
    divButtons.classList.add("buttons");
    divButtons.appendChild(buttonValidation);
    divButtons.appendChild(buttonReset);
    const result = document.createElement("span");
    result.id = "result";
    const resultTitle = document.createElement("span");
    const hover = document.createElement("div");
    hover.classList.add("result-hover");
    hover.id = "hover";
    resultTitle.id = "resulter";
    result.appendChild(resultTitle);
    result.appendChild(hover);
    result.classList.add("result");
    const nbDays = this.mois.reduce((prev, acc) => prev + acc.nbJours, 0);
    resultTitle.textContent = `${nbDays} jours correspondants`;
    result.style.display = "none";
    const div = document.createElement("div");
    div.classList.add("gestion");
    div.appendChild(select);
    div.appendChild(divButtons);
    div.appendChild(result);
    select.multiple = "true";
    select.id = "entries";
    entries.forEach(([key, value]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });

    select.addEventListener("change", (event) => {
      /**
       * @type {HTMLSelectElement}
       */
      const thisIs = event.target;
      const buttonValidation = document.getElementById("submit");
      const buttonReset = document.getElementById("reset");
      const nbOptionsSelected = Array.from(thisIs.selectedOptions);
      if (nbOptionsSelected.length === 0) {
        buttonValidation.style.display = "none";
        buttonReset.style.display = "none";
      } else {
        buttonReset.style.display = "initial";
        buttonValidation.style.display = "initial";
      }
    });
    buttonReset.addEventListener("click", () => {
      /**
       * @type {HTMLSelectElement}
       */
      const result = document.getElementById("result");
      result.style.display = "none";
      const select = document.getElementById("entries");
      Array.from(select.options).forEach((el) => (el.selected = false));
      select.selectedIndex = -1;
      select.dispatchEvent(new Event("change"));
    });

    buttonValidation.addEventListener("click", (event) => {
      /**
       * @type {HTMLButtonElement}
       */
      const thisIs = event.target;
      thisIs.style.display = "none";

      const hover = document.getElementById("hover");
      const select = document.getElementById("entries");
      const _result = document.getElementById("result");
      const result = document.getElementById("resulter");
      Array.from(hover.children).forEach((el) => el.remove());
      const values = Array.from(select.selectedOptions)
        .map((option) => option.value)
        .sort((a, b) => a.localeCompare(b));
      const count = this.getData(...values);
      _result.style.display = "initial";
      result.textContent = `${count.stat} jours correspondants`;
      count.days.forEach((el) => {
        const span = document.createElement("span");
        span.textContent = el;
        hover.appendChild(span);
      });
    });
    return div;
  }

  addSkipMonth() {
    const divGlobal = document.createElement("div");
    const title = document.createElement("h2");
    divGlobal.classList.add("_calendar");
    title.classList.add("calendar");
    title.textContent = "Calendrier";
    const div = document.createElement("div");
    div.classList.add("grid");
    const entries = Object.values(MoisFR);
    entries.forEach((el) => {
      const a = document.createElement("a");
      a.href = `#${el}`;
      a.addEventListener("click", (event) => {
        const thisIs = event.target;
        const other = Array.from(document.getElementsByClassName("active"));
        other.forEach((el) => el.classList.remove("active"));
        thisIs.classList.add("active");
      });
      a.textContent = el;
      div.appendChild(a);
    });
    divGlobal.appendChild(title);
    divGlobal.appendChild(div);
    return divGlobal;
  }

  /**
   *
   * @param {Absence | Site | null} statut
   * @returns {{statut: Absence | Site, value: string, icon: string}}
   */
  #getClassPerStatut(statut) {
    /**
     * @type {{statut: Absence | Site, value: string, icon: string}[]}
     */
    const classes = [
      { statut: Site.TELETRAVAIL, value: "teletravail", icon: "🏠" },
      { statut: Site.SUR_SITE, value: "site", icon: "🏢" },
      { statut: Absence.CONGES, value: "conges", icon: "🏖️" },
      { statut: Absence.RTT, value: "rtt", icon: "🏖️" },
      { statut: Absence.RTT_EMPLOYEUR, value: "rtt-e", icon: "🏖️" },
      { statut: Absence.FERIE, value: "ferie", icon: "🎉" },
      { statut: Absence.MALADE, value: "malade", icon: "🏥" },
      { statut: Absence.SANS_SOLDE, value: "sans-solde", icon: "☔" },
      { statut: Absence.WEEK_END, value: "week-end", icon: "📺" },
    ];

    const entriesAbsence = Object.values(Absence);
    const entriesSite = Object.values(Site);
    const entries = [...entriesAbsence, ...entriesSite];
    const allKeyIsDeclared = entries.every(
      (value) => classes.find((el) => el.statut === value) != null,
    );
    if (!allKeyIsDeclared) {
      throw new Error("missing defined key");
    }
    return statut
      ? classes.find((el) => el.statut === statut)
      : { statut: null, value: "non-defini", icon: "🔒" };
  }

  /**
   *
   * @param {HTMLElement} dest
   */
  load(dest) {
    if (this.#nbLoad !== 0) {
      throw new Error(
        "Cette méthode ne peut être appelée qu'une fois par Instance de Classe",
      );
    }
    ++this.#nbLoad;

    const central = document.createElement("div");
    central.classList.add("planning");
    const jour = this.date.getDate();
    const mois = this.date.getMonth();
    for (let e of this.mois) {
      const divGlobal = document.createElement("div");
      divGlobal.classList.add("_month");
      divGlobal.id = e.name;
      const spanMois = document.createElement("span");
      spanMois.classList.add("month-name");
      spanMois.textContent = e.name;
      const div = document.createElement("div");
      div.classList.add("month");
      e.days.forEach((day, index) => {
        const divDay = document.createElement("div");
        const spanNumber = document.createElement("span");
        spanNumber.classList.add("number-day");
        spanNumber.textContent = index + 1;
        divDay.classList.add("day");
        const indexMonth = this.mois.findIndex((m) => m.name === e.name) ?? 0;

        if (index === jour - 1 && e.name === this.mois[mois].name) {
          divDay.classList.add("current-day");
        } else if (
          (index < jour - 1 && e.name === this.mois[mois].name) ||
          indexMonth < mois
        ) {
          divDay.classList.add("previous-day");
        }
        divDay.appendChild(spanNumber);
        const spanDayFr = document.createElement("span");
        spanDayFr.textContent = day.nom;
        spanDayFr.classList.add("fr-day");
        divDay.appendChild(spanDayFr);
        const divStatuts = document.createElement("div");
        divStatuts.classList.add("statuts");
        divDay.appendChild(divStatuts);
        const dataAM = this.#getClassPerStatut(day.matin);
        const dataPM = this.#getClassPerStatut(day.apres_midi);
        const iconeAM = dataAM.icon;
        const iconePM = dataPM.icon;
        const classAM = dataAM.value;
        const classPM = dataPM.value;

        if (day.matin === day.apres_midi) {
          const spanActiviteDay = document.createElement("span");
          spanActiviteDay.textContent = iconeAM;
          spanActiviteDay.classList.add("statut-full", classAM);
          divStatuts.appendChild(spanActiviteDay);
        } else {
          const spanActiviteMatin = document.createElement("span");
          const spanActiviteApresMidi = document.createElement("span");
          spanActiviteMatin.textContent = iconeAM;
          spanActiviteMatin.classList.add("statut", classAM);
          spanActiviteApresMidi.textContent = iconePM;
          spanActiviteApresMidi.classList.add("statut", classPM);

          divStatuts.appendChild(spanActiviteMatin);
          divStatuts.appendChild(spanActiviteApresMidi);
        }

        if (day.activities.length) {
          const spanAlert = document.createElement("span");
          spanAlert.classList.add("alerts");
          spanAlert.textContent = `${day.activities.length}`;
          const spanActivities = document.createElement("span");
          spanActivities.classList.add("activities");
          day.activities.forEach((activity) => {
            const spanAct = document.createElement("div");
            spanAct.classList.add("activity");
            const fin = activity.heure_fin
              ? `\u00a0=>\u00a0${activity.heure_fin}`
              : "";
            const time = activity.heure_debut
              ? `${activity.heure_debut}${fin}\u00a0:\u00a0`
              : "";
            spanAct.innerHTML = `
              <span> ${time}${activity.nom} </span>
              <span> <i> ${activity.lieu} </i> </span>
            `;
            spanActivities.appendChild(spanAct);
          });
          spanAlert.appendChild(spanActivities);
          divDay.appendChild(spanAlert);
        }
        div.appendChild(divDay);
      });
      divGlobal.appendChild(spanMois);
      divGlobal.appendChild(div);
      central.appendChild(divGlobal);
    }
    const simpleDiv = document.createElement("div");
    simpleDiv.classList.add("container");
    const params = document.createElement("div");
    params.classList.add("params");
    params.appendChild(this.addSkipMonth());
    params.appendChild(this.addCount());

    simpleDiv.appendChild(params);
    simpleDiv.appendChild(central);
    dest.appendChild(simpleDiv);
  }
}

Planning.Jour = Jour;
Planning.MoisFR = MoisFR;
Planning.Day = Day;
Planning.Activity = Activity;
Planning.Momentum = Momentum;
Planning.Absence = Absence;
Planning.Site = Site;
