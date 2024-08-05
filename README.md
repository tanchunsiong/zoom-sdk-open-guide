The open guide to Zoom SDK, API and Webhook
=========================================

This open guide is an unofficial guide to Zoom's Developer Product. The intention of this guide is to provide a code centric and use-case centric approach. This is by no means an exhausive guide, and updates to this guide is best effort. 

This guide will by no means, compare the features and capabilities with other similar providers in the market.

Disclaimer: The main contributor of this open guide works for Zoom

Common Types of Developer Products used in this guide
=====================================

| Specific Zoom Developer Product       | Basics                         | What it is?                   | Official Guide                                 |
|---------------------------------------|--------------------------------|-------------------------------|------------------------------------------------|
| [Zoom REST API](#)                    | [REST API](#Rest-API)                  | Access to Zoom account / user Data   | [Zoom REST API](https://developers.zoom.us/docs/api/)             |
| [Zoom Meeting SDK](#)                 | [Meeting SDK](#Meeting-SDK)                  | Web, Desktop and Mobile Clients to join Zoom Meeting  | [Zoom Meeting SDK](https://developers.zoom.us/docs/meeting-sdk/)             |
| [Zoom Video SDK](#)                   | [Video SDK](#Video-SDK)                  | Web, Desktop and Mobile Clients to join Video Session | [Zoom Video SDK](https://developers.zoom.us/docs/video-sdk/)             |
| [Zoom Video SDK REST API](#)                   | [REST API](#Rest-API)              |Access to Video SDK specific Data | [Zoom Video SDK REST API](https://developers.zoom.us/docs/api/rest/zoom-video-sdk-api/)             |


High Level Information
----------------------

### When to use what products

This open guide provides you with code samples on how to achieve commonly asked scenarios using a combination of the above mentioned Zoom Developer Products.

Rest API
--------


The Zoom Open API or Zoom REST API allow developers to access account and/or user specific data by going through the OAuth flow or Server to Server OAuth flow.
You will often need a combination of REST API calls + In-Meeting (Meeting SDK) or In-Session (Video SDK)  API calls to achieve your use-cases.
The Meeting SDK and Video SDK has different sets of REST API, do refer to the correct base URL when making API calls to these endpoints.

### Types of Apps

The types of application which can retrieve access token, used for REST API are as follow

- OAuth App
- Meeting SDK
- Server to Server OAuth
- General App
- Video SDK App

| Apps used to access REST API     | Status                         | What it is?                   | Official Guide                                 |
|---------------------------------------|--------------------------------|-------------------------------|------------------------------------------------|
| OAuth App                   | Legacy              | OAuth 2.0 flow to get REST API access token   | [TBD]()             |
| Meeting SDK App             | Legacy              | Meeting SDK + OAuth 2.0 flow to get REST API token  | [TBD]()             |
| Server to Server OAuth App  | Current             | S2S OAuth flow to get REST API access token   | [TBD]()             |
| General App                 | Current             | All-in-one App Type which includes  OAuth 2.0 flow to get REST API access token  | [TBD]()             |
||||
|Video SDK App| Current | Video SDK App, which provides Client ID and Client Secret to generate Video SDK REST API access token|

### Types of Levels

These levels only applies to Meeting SDK. Video SDK has "Account Level" access

- User Level
- Account Level


### Commonly asked code samples related to REST API
1. How do I download a cloud recording?
2. How do i retrieve a list of all Meeting (past and scheduled)?

Meeting SDK
-----------

### Commonly asked code samples related to Meeting SDK
1. How do I force a Meeting to end after xx number of minutes?
2. How do I calculate number of minutes used in a month?
3. [How do I create a web service which will help to generate a Meeting SDK Auth token?](https://github.com/zoom/meetingsdk-auth-endpoint-sample)
4. [How do I create a Python CLI app which will generate a Meeting SDK Auth Token](https://github.com/tanchunsiong/zoom-sdk-jwt-signature-generator)

Video SDK
---------

### Commonly asked code samples related to Video SDK
1. How do I force a Session to end after xx number of minutes?
2.  How do I calculate number of minutes used in a month?
3.  [How do I create a Python CLI app which will generate a Video SDK Auth Token](https://github.com/tanchunsiong/zoom-sdk-jwt-signature-generator)
