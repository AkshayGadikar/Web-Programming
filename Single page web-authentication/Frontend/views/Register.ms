<!DOCTYPE html>
<html>
<head></head>
<title> Registration Page </title>
<body>
<form method="POST" action="/validate">
  <div class="container">
	<br>
	<label><b>First Name</b></label>
    <input type="text" placeholder="Enter First Name" id="FirstName" name="First_Name" value="{{firstname}}">
	{{#emptyError}}<span class="error">{{emptyError}}<br></span>{{/emptyError}}
	<br><br>
	<label><b>Last Name</b></label>
    <input type="text" placeholder="Enter Last Name" id="LastName" name="Last_Name" value="{{lastname}}">
	{{#emptyError}}<span class="error">{{emptyError}}<br></span>{{/emptyError}}
	<br><br>
    <label><b>Email Address</b></label>
    <input type="text" placeholder="Enter email" id="email" name="email" value="{{email_id}}">
	{{#emptyError}}<span class="error">{{emptyError}}<br></span>{{/emptyError}}
	{{#emailError}}<span class="error">{{emailError}}<br></span>{{/emailError}}
	<br><br>
    <label><b>Password</b></label>
    <input type="password" placeholder="Enter Password" id="password" name="psw">
	{{#emptyError}}<span class="error">{{emptyError}}<br></span>{{/emptyError}}
	{{#passwordError}}<span class="error">{{passwordError}}<br></span>{{/passwordError}}
	<br><br>
	<label><b>Repeat Password</b></label>
    <input type="password" placeholder="Enter Password" name="rpsw">
	{{#emptyError}}<span class="error">{{emptyError}}<br></span>{{/emptyError}}
	{{#passwordError}}<span class="error">{{passwordError}}<br></span>{{/passwordError}}
	<br><br>
    <button type="submit">Register</button>
	<br><br>
  </div>
</form>
<a href="/Login.html">Click here to Login</a>
</body>
</html>