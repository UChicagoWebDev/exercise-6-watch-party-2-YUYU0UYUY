// Constants to easily refer to pages
const SPLASH = document.querySelector(".splash")
const PROFILE = document.querySelector(".profile")
const LOGIN = document.querySelector(".login")
const ROOM = document.querySelector(".room")

// Custom validation on the password reset fields
const passwordField = document.querySelector(".profile input[name=password]")
const repeatPasswordField = document.querySelector(".profile input[name=repeatPassword]")
const repeatPasswordMatches = () => {
  const p = document.querySelector(".profile input[name=password]").value
  const r = repeatPassword.value
  return p == r
}

const checkPasswordRepeat = () => {
  const passwordField = document.querySelector(".profile input[name=password]")
  if (passwordField.value == repeatPasswordField.value) {
    repeatPasswordField.setCustomValidity("")
    return
  } else {
    repeatPasswordField.setCustomValidity("Password doesn't match")
  }
}

passwordField.addEventListener("input", checkPasswordRepeat)
repeatPasswordField.addEventListener("input", checkPasswordRepeat)

// TODO:  On page load, read the path and whether the user has valid credentials:
//        - If they ask for the splash page ("/"), display it
//        - If they ask for the login page ("/login") and don't have credentials, display it
//        - If they ask for the login page ("/login") and have credentials, send them to "/"
//        - If they ask for any other valid page ("/profile" or "/room") and do have credentials,
//          show it to them
//        - If they ask for any other valid page ("/profile" or "/room") and don't have
//          credentials, send them to "/login", but remember where they were trying to go. If they
//          login successfully, send them to their original destination
//        - Hide all other pages

// TODO:  When displaying a page, update the DOM to show the appropriate content for any element
//        that currently contains a {{ }} placeholder. You do not have to parse variable names out
//        of the curly  braces—they are for illustration only. You can just replace the contents
//        of the parent element (and in fact can remove the {{}} from index.html if you want).

// TODO:  Handle clicks on the UI elements.
//        - Send API requests with fetch where appropriate.
//        - Parse the results and update the page.
//        - When the user goes to a new "page" ("/", "/login", "/profile", or "/room"), push it to
//          History

// TODO:  When a user enters a room, start a process that queries for new chat messages every 0.1
//        seconds. When the user leaves the room, cancel that process.
//        (Hint: https://developer.mozilla.org/en-US/docs/Web/API/setInterval#return_value)

// On page load, show the appropriate page and hide the others
window.addEventListener('DOMContentLoaded', function () {

  // -------------------------------- Load ----------------------------------  

  // Show the page currently in and hide unused page
  showPage()
  // Show the user information
  showUserName()

  window.addEventListener('popstate', (event) => {
    console.log("Popstate event triggered", event.state)
    showPage()
    showUserName()
  })

  // -------------------------------- Main Page ----------------------------------

  // click Signup Button
  const signUpButton = document.querySelector(".signup")
  if (signUpButton) {
    signUpButton.addEventListener("click", function (e) {
      e.preventDefault()
      onclickSignUp()
    })
  }
  else {
    console.error("No signup Button")
  }

  // click loggedin Button to go to profile
  const profileButton = document.querySelector(".loggedIn")
  if (profileButton) {
    profileButton.addEventListener("click", function (e) {
      e.preventDefault()
      onclickProfile()
    })
  }
  else {
    console.error("No logged in Button")
  }

  // -------------------------------- Login Page ----------------------------------
  // CreateUsers
  const createUserButton = document.getElementById("createUsers")
  if (createUserButton) {
    createUserButton.addEventListener("click", function (e) {
      e.preventDefault()
      onclickCreateUsers()
    })
  }
  else {
    console.error("No createUser Button")
  }

  // -------------------------------- Profile Page ----------------------------------
  // CreateUsers
  const logoutButton = document.querySelector(".exit.logout")
  if (logoutButton) {
    logoutButton.addEventListener("click", function (e) {
      e.preventDefault()
      onclickLogOut()
    })
  }
  else {
    console.error("No logout Button")
  }
})


// -------------------------------- EventListener Page ----------------------------------
// navigate to login page
function onclickSignUp () {
  const state = { path: "/login" }
  const url = "/login"
  history.pushState(state, "", url)
  showPage()
}

// navigate to login page
function onclickProfile () {
  const state = { path: "/profile" }
  const url = "/profile"
  history.pushState(state, "", url)
  showPage()
}


// Create Users
function onclickCreateUsers () {
  fetch('/api/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json() // Assuming the API returns JSON data
    })
    .then(user => {
      localStorage.setItem('userName', user.user_name)
      localStorage.setItem('api_key', user.api_key)
      showUserName()
      console.log(localStorage)
    })
    .catch(error => console.error('There was a problem with your fetch operation:', error))
}

// log out user
function onclickLogOut () {
  localStorage.removeItem("userName")
  localStorage.removeItem("api_key")
  console.log(localStorage)
  const state = { path: "/" }
  const url = "/"
  history.pushState(state, "", url)
  showPage()
  showUserName()
}



// -------------------------------- helper ----------------------------------
// Show page currently in
function showPage () {
  SPLASH.classList.add("hide")
  PROFILE.classList.add("hide")
  LOGIN.classList.add("hide")
  ROOM.classList.add("hide")
  const path = window.location.pathname

  // Main page
  if (path == "/") {
    SPLASH.classList.remove("hide")
  }
  // Profile Page
  else if (path == "/profile") {
    PROFILE.classList.remove("hide")
  }
  // Login Page
  else if (path == "/login") {
    LOGIN.classList.remove("hide")
  }
  // Chat Room page
  else if (path.startsWith("/rooms/")) {
    ROOM.classList.remove("hide")
  }
  else {

  }
}

// Show user name in correct place
function showUserName () {
  // Get user name from storage
  let user_name = localStorage.getItem("userName")
  // If not logged in, show visitor
  if (!user_name) {
    user_name = "Visitor"
  }

  const userNameLists = document.querySelectorAll(".username")

  userNameLists.forEach(name => {
    name.textContent = user_name
  })
}


