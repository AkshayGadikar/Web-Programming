<!DOCTYPE html>
<html>
<head></head>
<title> Registration Page </title>
<body>
<h2>Account Page</h2>
<br>
<form method="POST" action="/accountinfo">
  <div class="container">
	<br>
	<label><b>First Name</b></label>
	{{#FirstName}}<span class="error">{{FirstName}}<br></span>{{/FirstName}}
	<br>
	<label><b>Last Name</b></label>
	{{#LastName}}<span class="error">{{LastName}}<br></span>{{/LastName}}
	<br><br>
  </div>
</form>
<a href="/Logout">Click here to Logout</a>
</body>
</html>