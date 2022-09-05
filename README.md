# Nuber Eats

The Backend of Nuber Eats Clone
## User Entity: 

- id
- createdAt
- updatedAt

- email
- password
- role(client | owner | delivery)

## User CRUD

- Create Account
- Log In
- See Profile
- EditProfile
- Verify Email

## Restaurant Model 

- name
- category 
- address
- coverImage

## Restaurant CRUD

- See Categories
- See Restaurants by Category (pagination)
- See Restaurants (pagination)
- See Restaurant
- Search Restaurant

- Edit Restaurant
- Delete Restaurant 

- Create Dish
- Edit Dish 
- Delete Dish

## Orders CRUD

- Orders Subscription: 
  - Pending Orders (Owner) (subs: newOrder)  (trigger: createOrder)
  - Order Status (Owner, Delivery,Customer) (subs: orderUpdate) (trigger: editOrder(orderUpdate))
  - Pending Pickup Order (Delivery) (subs: orderUpdate) (trigger: editOrder(orderUpdate))

- Payments (CRON)