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
  // Show all rooms
  showRooms()

  window.addEventListener('popstate', (event) => {
    console.log("Popstate event triggered", event.state)
    showPage()
    showUserName()
    showRooms()
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

  // click profilelink on the main page to go to profile
  const profileButton = document.querySelector(".loggedIn a")
  if (profileButton) {
    profileButton.addEventListener("click", function (e) {
      e.preventDefault()
      onclickProfile()
    })
  }
  else {
    console.error("No logged in Button")
  }

  // click login Button
  const loginLink = document.querySelector(".loggedOut a")
  if (loginLink) {
    loginLink.addEventListener("click", function (e) {
      e.preventDefault()
      // Same navigation function
      onclickSignUp()
    })
  }
  else {
    console.error("No login Button")
  }


  // click createRoom Button
  const createRoomButton = document.getElementById("createRoom")
  if (createRoomButton) {
    createRoomButton.addEventListener("click", function (e) {
      e.preventDefault()
      // createRoom
      onclickCreateRoom()
    })
  }
  else {
    console.error("No login Button")
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

  // Login
  const loginButton = document.getElementById("loginUsers")
  if (loginButton) {
    loginButton.addEventListener("click", function (e) {
      e.preventDefault()
      onclickLogin()
    })
  }
  else {
    console.error("No createUser Button")
  }

  // -------------------------------- Profile Page ----------------------------------
  // LogOutUsers
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

  // UpdateUserName
  const updateUserNameButton = document.getElementById("updateUsername")
  if (updateUserNameButton) {
    updateUserNameButton.addEventListener("click", function (e) {
      e.preventDefault()
      onclickUpdateName()
    })
  }
  else {
    console.error("No updateUser Button")
  }

  // UpdatePassword
  const updatePasswordButton = document.getElementById("updatePassword")
  if (updatePasswordButton) {
    updatePasswordButton.addEventListener("click", function (e) {
      e.preventDefault()
      onclickUpdatePassword()
    })
  }
  else {
    console.error("No updateUser Button")
  }
})


// -------------------------------- EventListener Page ----------------------------------
// navigate to login page
function onclickSignUp () {
  const failedDiv = document.getElementById('loginFailedMessage')
  failedDiv.style.display = 'none'
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
      localStorage.setItem('user_id', user.user_id)
      showUserName()
      console.log(localStorage)
      const state = { path: "/" }
      const url = "/"
      history.pushState(state, "", url)
      showPage()
    })
    .catch(error => console.error('There was a problem with your fetch operation:', error))
}

// Users Login
function onclickLogin () {
  const usernameInput = document.getElementById("usernameInput")
  const passwordInput = document.getElementById("passwordInput")
  const user_name = usernameInput.value
  const password = passwordInput.value

  const user_login_info = {
    "user_name": user_name,
    "password": password
  }

  fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user_login_info)
  })
    .then(response => {
      return response.json() // Assuming the API returns JSON data
    })
    .then(user => {
      if (user.login) {
        console.log(user)
        localStorage.setItem('userName', user.user_name)
        localStorage.setItem('api_key', user.api_key)
        localStorage.setItem('user_id', user.user_id)
        showUserName()
        console.log(localStorage)
        const state = { path: "/" }
        const url = "/"
        history.pushState(state, "", url)
        showPage()
      }
      else {
        document.getElementById('loginFailedMessage').style.display = 'block'
      }
    })
    .catch(error => console.error('There was a problem with your fetch operation:', error))
}

// log out user
function onclickLogOut () {
  localStorage.removeItem("userName")
  localStorage.removeItem("api_key")
  localStorage.removeItem("user_id")
  console.log(localStorage)
  const state = { path: "/" }
  const url = "/"
  history.pushState(state, "", url)
  showPage()
  showUserName()
}

// Update user name
function onclickUpdateName () {
  const usernameInput = document.getElementById("updateUserNameInput")
  const user_name = usernameInput.value

  const name_update_info = {
    "user_name": user_name,
    "user_id": localStorage.getItem('user_id')
  }

  fetch('/api/updateUserName', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-Key': localStorage.getItem('api_key')
    },
    body: JSON.stringify(name_update_info)
  })
    .then(response => {
      return response.json() // Assuming the API returns JSON data
    })
    .then(user => {
      if (user.update) {
        console.log(user)
        localStorage.setItem('userName', user_name)
        showUserName()
        console.log(localStorage)
        showPage()
      }
    })
    .catch(error => console.error('There was a problem with your fetch operation:', error))
}


// Update password
function onclickUpdatePassword () {
  const pwdInput = document.getElementById("updatePasswordInput")
  const pwd = pwdInput.value
  const repeatInput = document.getElementById("repeatPasswordInput")
  const repeatPwd = repeatInput.value

  const pwdError = document.getElementById('pwdnotmatch')
  pwdError.style.display = 'none'

  if (pwd != repeatPwd) {
    pwdError.style.display = 'block'
    return
  }

  const pwd_update_info = {
    "password": pwd,
    "user_id": localStorage.getItem('user_id')
  }

  fetch('/api/updatePassword', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-Key': localStorage.getItem('api_key')
    },
    body: JSON.stringify(pwd_update_info)
  })
    .then(response => {
      return response.json() // Assuming the API returns JSON data
    })
    .then(user => {
      if (user.update) {
        showPage()
      }
    })
    .catch(error => console.error('There was a problem with your fetch operation:', error))
}

// createRooms
function onclickCreateRoom () {
  fetch('/api/room/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-Key': localStorage.getItem('api_key')
    },
  })
    .then(response => {
      return response.json() // Assuming the API returns JSON data
    })
    .then(user => {
      if (user.update) {
        showPage()
      }
    })
    .catch(error => console.error('There was a problem with your fetch operation:', error))
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

// Show rooms on the main page
function showRooms () {
  fetch('/api/room/showRoom', {
    method: 'GET',
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
    .then(rooms => {
      console.log(rooms)
      const noRoom = document.querySelector(".noRooms")
      if (rooms.length > 0) {
        const roomsDiv = document.querySelector(".roomList")
        roomsDiv.innerHTML = ""

        rooms.forEach(room => {
          const roomLink = document.createElement('a')
          roomLink.innerHTML = `${room.room_id}: <strong> ${room.room_name} </strong>`
          roomLink.addEventListener("click", function (e) {
            e.preventDefault()
            const state = { path: `/rooms/${room.room_id}` }
            const url = `/rooms/${room.room_id}`
            history.pushState(state, "", url)
            showPage()
          })
          roomsDiv.appendChild(roomLink)
        })
        noRoom.style.display = "none"

      }
      else {
        noRoom.style.display = "block"
      }
    })
    .catch(error => console.error('There was a problem with your fetch operation:', error))
}

