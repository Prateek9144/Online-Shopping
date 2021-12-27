# Online-Store

Shopticon is an Open Source E-Commerce Platform based on Node.js.
https://shopticon.herokuapp.com

- Product Catalogue
- User cart
- Order history
- Administration
<!-- - REST API -->

## How to Run?

- Install the requirements using `npm install`
  > nodemon.json

```
{
  "env": {
		"MONGO_USER": "<MongoBD username>",
		"MONGO_PASSWORD": "<MongoBD password>",
		"MONGO_DEFAULT_DATABASE": "<Collection name>"
		"SECRET": "<Secret key for session>",
		"SENDGRID_API": "<Sendgrid API>",
		"STRIPE_API": "<Stripe API>"
  }
}

```

- Run server `npm start`
