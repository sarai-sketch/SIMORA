# SIMORA demo accounts and transaction flows

## Demo credentials

- Landowner: `owner@simora.com` / `Simora123!`
- Farmer: `farmer@simora.com` / `Simora123!`

## Demo-only persistence

Accounts, listings, crop edits, lease requests and purchase offers use browser localStorage. Clear site data to reset the demo. No remote database or payment provider is required.

## Lease lifecycle

Tenant selects a property, start date and duration → SIMORA calculates the end date and estimated total → tenant submits request → owner reviews it under My Parcels → owner accepts or declines.

## Purchase lifecycle

Buyer opens a property → enters offer amount and message → submits offer → owner reviews it under My Parcels → owner accepts or declines. Payment, contract signing and legal title transfer are outside this demo.

## List a property

Sign in → List Your Land → enter property details, coordinates, land area, soil, lease and/or sale prices, optional satellite image URL and description → Publish Property → listing appears in the catalog and owner's My Parcels.
