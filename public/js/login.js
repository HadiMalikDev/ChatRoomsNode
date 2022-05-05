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
    localStorage.setItem("token",js.token)
    window.location.replace('/html/room.html')
  } else {
    errorMessage.textContent =
      js.error || "Could not login right now";
    errorMessage.style.visibility = "visible";
  }
});
