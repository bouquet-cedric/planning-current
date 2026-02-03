export function passwordPrompt(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.id = "modale";

    const box = document.createElement("div");
    box.id = "modale-box";

    const borderBox = document.createElement("div");
    borderBox.id = "modale-border-box";

    const h1 = document.createElement("h1");
    h1.textContent = "Bienvenue sur Planning";

    const form = document.createElement("form");

    const text = document.createElement("span");
    text.id = "title";
    text.textContent = message;

    const input = document.createElement("input");
    input.type = "password";

    const button = document.createElement("button");
    button.type = "submit";
    button.textContent = "Login";
    button.classList.add("modale-box-confirm");

    button.addEventListener("click", () => {
      resolve(input.value);
      document.body.removeChild(overlay);
    });

    box.append(h1, form);
    form.append(borderBox);
    borderBox.append(text, input, button);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    input.focus();
  });
}
