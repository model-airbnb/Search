# Model Airbnb: Search Service

This is a project that models a service for inventory search requests from an app server in order to respond to a customer's search for available listings on Airbnb. In the first version, a basic search on destination and date range is supported. Subsequent versions will support refining the search on additional parameters, such as room type, price range and amenities. Internally, this search service will maintain a local inventory store, which is updated with the inventory updates that an external inventory service will publish and that this service will consume. This search service will also consume listing attribute weights published by an external recommendations service, which are applied to the scoring of each available property listing in order to sort the search results in an order that aims to maximize booking conversion. An analytics dashboard is provided for the operational metrics related to search queries and the associated results; the same information is also published by this search service for consumption by external services that track user behaviour and provide additional analytics for the overall system.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

# Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)

## Usage

> Some usage instructions

## Requirements

- Node 6.9.x
- Postgresql 9.6.5
- Amazon SQS
- Elastic Search
- Kibana

## Other Information

(TODO: fill this out with details about your project. Suggested ideas: architecture diagram, schema, and any other details from your app plan that sound interesting.)
