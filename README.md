# Metro System

Metro System is a web application that simulates a modern and efficient public transportation system for a metropolitan area. The project allows users to manage stations, routes, ticket purchases, subscriptions, and ride simulations. The system also provides administrative functionalities for managing stations, routes, and requests.

## Features

- Station Management:
  - Create new normal stations not connected to any station
  - Update station names
  - Delete start, middle, end, and transfer stations
  - Handle deleted routes and update station names with new routes

- Route Management:
  - Create routes for newly created stations by connecting them to other stations
  - Handle only two positions (start or end) for connecting stations
  - Create routes in both forward and backward directions

- Request Handling:
  - Accept or reject any request made in the system

- Subscription Management:
  - Purchase subscriptions through online payment
  - Subscriptions provide a specific number of tickets for different durations (annual, quarterly, monthly)

- Ticket Purchase:
  - Purchase tickets through subscriptions
  - Indicate ticket price, route, and transfer stations
  - Upcoming rides are scheduled on the ticket date with zero price
  - Purchase tickets through online payment for users without subscriptions

- Price Checking:
  - Check the price of a ticket by specifying the origin and destination stations

- Ride Simulation:
  - Start a ride by choosing the origin and destination stations and the trip date
  - Complete the ride simulation

- Ticket Refund:
  - Refund future-dated tickets
  - Handle refunding tickets paid by subscription or online payment
  - Maintain transaction records for refunds

## Technologies Used

- Front-end:
  - HTML, CSS, JavaScript
  - React.js for building the user interface
  - Redux for state management
  - Bootstrap for responsive design
  
- Back-end:
  - Node.js as the runtime environment
  - Express.js as the web application framework
  - MongoDB for the database
  - Mongoose as the ODM (Object Data Modeling) library
  - Passport.js for user authentication and session management

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request.
License

This project is licensed under the MIT License.
## Acknowledgements

    Thanks to the developers and contributors of the open-source libraries and frameworks used in this project.
    Special thanks to the Metro System team for their hard work and dedication. ( Gorge, Omar, Abdullah, Ahmed)
