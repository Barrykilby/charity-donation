
# Shopify Charity Donation Checkout UI/Function

This repo provides the basis for a Checkout Donation UI element and supporting cart transform/rules.
**It is provided with no warranty or endorsement and may be freely used and modified within your own projects.** 

***note**: this app provides no UI in the admin, just the basics.*  

## Getting Started

**1.** You must [download and install Node.js](https://nodejs.org/en/download/) if you don't already have it.

**2.** You must [create a Shopify partner account](https://partners.shopify.com/signup) if you don’t have one.

**3.** You must create a store for testing if you don't have one, either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store).

**4.** If you don't have it already install the [The Shopify CLI](https://shopify.dev/docs/apps/tools/cli) and run basic setup steps

**5.** Clone this repo:

```shell 
git clone git@github.com:Barrykilby/charity-donation.git
cd charity-donation
```

**6.** You can develop locally using your preferred package manager. Run one of the following commands, and you should be walked through the steps connecting the code to an partners account, app & store.
  

Using yarn:

```shell
yarn  dev
```

Using npm:
  
```shell
npm  run  dev
```

Using pnpm:
  

```shell
pnpm  run  dev
```

Open the URL generated in your console. Once you grant permission to the app, you can start development (such as generating extensions).

**7.** Once you can see the UI elements in the Checkout you also need to activate the functions, this can be done in one of two ways currently.
	
a) Open `https://admin.shopify.com/store/<your-store-name>/settings/checkout` and scroll to the bottom, you should see "Checkout rules" with a button to "Add Rule". From there you should be able to enable the functions (*this is the preferred route for enabling the validation rule.*)

b) Open the GraphiQL (Admin API) in your browser by pressing 'g' in your terminal window from step 6

Run to validate you can see the functions installed in the store:
```graphQL
query { 
	shopifyFunctions(first: 25) { 
		nodes { 
			app { title } 
				apiType
				title
				id
			}
		}
	}
```

Run to with the correct function ID to activate the cart transform function:
```graphQL
mutation { 
	cartTransformCreate(functionId: "YOUR_FUNCTION_ID_HERE") { 
		cartTransform { 
			id 
			functionId 
		} 
		userErrors { 
			field
			message
		 } 
	 } 
 }
```

You can debug functions via the partners account once you have them running. 

If you receive any permissions errors during running the above commands try installing the app to your store via the partners account and confirming any permissions prompts as you do so.

**To work correctly there must be a product with the handle 'donation' already in setup in the store as it will be used as the basis for the donation product title, image etc** 

## Production

Deploying to production is as simple as running step 6 with 'deploy' rather than 'dev' and ensuring via partners the app is installed to your production store.
  

## Developer resources

  

- [Introduction to Shopify apps](https://shopify.dev/docs/apps/getting-started)

- [App authentication](https://shopify.dev/docs/apps/auth)

- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)

- [Shopify API Library documentation](https://github.com/Shopify/shopify-api-js#readme)