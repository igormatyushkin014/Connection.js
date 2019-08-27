<p align="center">
	<img src="images/logo.png" alt="Manifest" title="Manifest">
</p>

## At a Glance

`Connection.js` is a new way of socket communication. It automatically converts sockets into user profiles and helps developer to associate personal data with each connected user. Also, `Connection.js` simplifies socket networking by asynchronous callbacks. The library is built on top of [socket.io](https://socket.io).

## How to Get Started

Copy [connection.js](connection.js) file to your project. Then add scripts to your HTML document:

```html
<script src="/socket.io/socket.io.js"></script>
<script src="connection.js"></script>
```

## Usage

### Initial setup

Create `Connection` instance:

```javascript
const connection = new Connection({
	/*
		For now we can leave configuration empty.
	*/
});
```

That's all that you need to get started. Additionally, you can handle connection events:

```javascript
const connection = new Connection({
	onConnected: () => {
		console.log("Connected");
	},
	onDisconnected: () => {
		console.log("Disconnected");
	}
});
```

### Request and Response

In `socket.io`, every message sent between client and server includes event name and (optionally) some data. In `Connection` library, we use a different way of communication: request and response. It's similar to regular APIs where we send data by HTTP channel and (sometimes) receive response.

Because `Connection` uses `socket.io` under the hood, it actually sends socket messages between client and server. By default, we use `connection.event` string for event name. If by some reason you want to change default event name, you still can do this via configuration object:

```javascript
const connection = new Connection({
	event: "DEFAULT-EVENT-NAME"
});
```

To receive requests from server, set up your configuration:

```javascript
const connection = new Connection({
	// ...
	onRequest: (data) => {
		/*
			Handle data sent by server.
		*/
	},
	// ...
});
```

Also, it's possible to send response immediately:

```javascript
const connection = new Connection({
	// ...
	onRequest: (data, respond) => {
		respond({
			text: "Hello server!"
		});
	},
	// ...
});
```

Sending request from client to server is super simple:

```javascript
connection.request({
	data: {
		text: "Hello server!"
	},
	callback: (data) => {
		/*
			Handle response.
		*/
	}
});
```

### Conclusion

Here's an example of extended configuration for `Connection` instance:

```javascript
const connection = new Connection({
	onConnected: () => {
		console.log("Connected");
	},
	onRequest: (data, respond) => {
		respond({
			text: "Hello server!"
		});
	},
	onDisconnected: () => {
		console.log("Disconnected");
	}
});
```

Most of things presented in configuration are optional. You can combine necessary settings to get the server functioning right.

## License

`Connection.js` is available under the Apache 2.0 license. See the [LICENSE](./LICENSE) file for more info.
