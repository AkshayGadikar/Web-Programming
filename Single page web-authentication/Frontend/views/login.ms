<!DOCTYPE html>
<html>
  <head>
    <title>Login</title>
  </head>
  <body>
    <form method="POST" action="/LoginSubmit">
      <div class="container">
		<label><b>Email Address</b></label>
		<input type="text" placeholder="Enter email" id="email" name="email" value="{{email_id}}">
    {{#emptyError}}<span class="error">{{emptyError}}<br></span>{{/emptyError}}
    {{#emailError}}<span class="error">{{emailError}}<br></span>{{/emailError}}
		<br><br>
		<label><b>Password</b></label>
		<input type="password" placeholder="Enter Password" id="password" name="psw">
    {{#emptyError}}<span class="error">{{emptyError}}<br></span>{{/emptyError}}
		<br><br>
		<button type="submit">Login</button>
		</div>
    </form> 
    <a href="/Register">Click here to Register</a>
  </body>
</html>
