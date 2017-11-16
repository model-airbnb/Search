# Model Airbnb: Search Service

This project models a service for inventory search requests from an app server in order to respond to a customer's search for available listings on a lodging site like Airbnb. In the first version, a basic search on destination and date range is supported. Subsequent versions will support refining the search on additional parameters, such as room type, price range and amenities. The search service communicates with external services using a message bus architecture. Specifically, this search service maintains a local inventory store that is updated with the messages that an external inventory service publishes. It also consumes listing attribute weights published by an external recommendations service, which are applied to sort the search results in an order that aims to maximize booking conversion. The search service publishes search event data that is consumed by other services for overall system analytics and user experience personalization. In fact, one of the consumers of this data is the search service's own analytics component, which maintains an analytics dashboard for the monitoring of operational metrics related to search queries and response time latency.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

# Table of Contents

1. [Requirements](#requirements)
1. [System Design](#system-design)

# Requirements

- Node 6.11.2
- Express 4.16.2
- Postgresql 9.6.5
- MongoDB 3.4.9
- Amazon SQS (for message bus communication)
- Java 8 (for Elastic Search and Kibana)
- Elastic Search 5.6.3
- Kibana 5.6.3

# System Design
- [Server Architecture](./docs/Architecture.md)
