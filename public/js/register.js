const registerForm=document.forms.registerForm
const errorMessage = document.getElementById("error-message");
errorMessage.style.visibility = "hidden";

async function sendRegisterDataToServer(data) {
  const res = await fetch("/users/register", {
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
function showErrorMessage(message) {
  errorMessage.textContent = message || "Could not register right now";
  errorMessage.style.visibility = "visible";
}

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (
    document.getElementById("password").textContent !=
    document.getElementById("password-confirmation").textContent
  ) {
    return showErrorMessage("Passwords do not match. Please try again");
  }

  const data = getFormData(registerForm);
  const res = await sendRegisterDataToServer(data);
  const js = await res.json();
  if (res.ok || res.status==201) {
    //Successful login
    localStorage.setItem("token",js.token);
    window.location.replace('/html/room.html')
  } else {
    showErrorMessage(js.error);
  }
});
