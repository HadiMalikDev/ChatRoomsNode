const form = document.getElementById("loginForm");
const errorMessage = document.getElementById("error-message");
errorMessage.style.visibility='hidden'


async function sendLoginDataToServer(data) {
  const res = await fetch("/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res;
}
const getFormData = (form) => {
  const formData = new FormData(form);
  const data = {};
  formData.forEach((val, key) => {
    data[key] = val;
  });
  console.log(data);
  return data;
};
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formToSend = document.forms.loginForm;
  const data = getFormData(formToSend);
  const res = await sendLoginDataToServer(data);
  const js = await res.json();
  if (res.ok) {
    //Successful login
    console.log("Login successful!");
    localStorage.setItem("token",js.token)
    console.log(localStorage.getItem("token"))
  } else {
    console.log("called");
    console.log(errorMessage)
    errorMessage.textContent =
      js.error || "Could not login right now";
    errorMessage.style.visibility = "visible";
  }
});
