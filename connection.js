class IdGenerator {

	constructor() {
		this.lastId = 0;
	}

	getNextId() {
		let nextId = this.lastId + 1;
		this.lastId = nextId;
		return `${nextId}`;
	}
}

class Request {

	constructor() {
		this.type = "request";
		this.requestId = "";
		this.recipientId = undefined;
		this.data = {};
	}
}

class RequestOptions {

	constructor() {
		this.recipientId = undefined;
		this.data = {};
		this.callback = undefined;
	}
}

class Response {

	constructor() {
		this.type = "response";
		this.requestId = undefined;
		this.data = {};
	}
}

class ResponseHandler {

	constructor() {
		this.requestId = "";
		this.handler = (data) => {
		};
	}
}

class ConnectionConfiguration {

	constructor() {
		this.event = undefined;
		this.onConnected = () => {
		};
		this.onRequest = (data, respond) => {
		};
		this.onDisconnected = () => {
		};
	}
}

class Connection {

	static defaultEvent = "connection.event";

	constructor(
		configuration
	) {
		this.socket = io();
		this.configuration = configuration;
		this.responseHandlers = [];
		this.idGenerator = new IdGenerator();

		this.socket.on(
			"connect",
			(data) => {
				if (this.configuration.onConnected) {
					this.configuration.onConnected();
				}
			}
		);

		this.socket.on(
			this.getEvent(),
			(data) => {
				switch (data.type) {
					case "request": {
						/*
							Получен запрос.
						*/
						let request = data;

						if (this.configuration.onRequest) {
							this.configuration.onRequest(
								request.data,
								(data) => {
									this.response(
										request.requestId,
										data
									);
								}
							);
						}
						break;
					}
					case "response": {
						/*
							Получен ответ на запрос.
						*/
						let responseHandlerIndex = this.responseHandlers
							.findIndex((responseHandler) => {
								return responseHandler.requestId === data.requestId;
							});

						if (responseHandlerIndex < 0 || responseHandlerIndex >= this.responseHandlers.length) {
							return;
						}

						let responseHandler = this.responseHandlers[responseHandlerIndex];
						this.responseHandlers.splice(responseHandlerIndex, 1);
						responseHandler.handler(data.data);
						break;
					}
					default: {
						/*
							Неизвестный тип сообщения.
						*/
						break;
					}
				}
			}
		);

		this.socket.on(
			"disconnect",
			(data) => {
				if (this.configuration.onDisconnected) {
					this.configuration.onDisconnected();
				}
			}
		);
	}

	getEvent() {
		return this.configuration.event
			|| Connection.defaultEvent;
	}

	request(
		configuration
	) {
		let event = this.getEvent();
		let requestId = this.idGenerator.getNextId();

		let request = new Request();
		request.requestId = requestId;
		request.recipientId = configuration.recipientId;
		request.data = configuration.data;

		if (configuration.callback) {
			let responseHandler = new ResponseHandler();
			responseHandler.requestId = requestId;
			responseHandler.handler = configuration.callback;
			
			this.responseHandlers.push(
				responseHandler
			);
		}

		this.socket.emit(
			event,
			request
		);
	}

	response(
		requestId,
		data
	) {
		let event = this.getEvent();

		let response = new Response();
		response.requestId = requestId;
		response.data = data;

		this.socket.emit(
			event,
			response
		);
	}
}
