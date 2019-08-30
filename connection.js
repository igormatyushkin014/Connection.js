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

	static getType() {
		return "raw.request";
	}

	constructor() {
		this.type = Request.getType();
		this.requestId = "";
		this.recipientId = undefined;
		this.event = undefined;
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

	static getType() {
		return "raw.response";
	}

	constructor() {
		this.type = Response.getType();
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
		this.onConnected = () => {
		};
		this.onRequest = (request, respond) => {
		};
		this.onDisconnected = () => {
		};
	}
}

class Connection {

	static getEvent() {
		return "connection.event";
	}

	constructor(
		configuration
	) {
		this.socket = io();
		this.configuration = configuration;
		this.responseHandlers = [];
		this.idGenerator = new IdGenerator();
		this._setupSocketIO();
	}

	_setupSocketIO() {
		this.socket.on(
			"connect",
			(data) => {
				if (this.configuration.onConnected) {
					this.configuration.onConnected();
				}
			}
		);

		this.socket.on(
			Connection.getEvent(),
			(data) => {
				switch (data.type) {
					case Request.getType(): {
						/*
							Получен запрос.
						*/
						let request = {
							event: data.event,
							data: data.data
						};

						if (this.configuration.onRequest) {
							this.configuration.onRequest(
								request,
								(data) => {
									this._response(
										request.requestId,
										data
									);
								}
							);
						}
						break;
					}
					case Response.getType(): {
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

	_request(
		configuration
	) {
		let event = Connection.getEvent();
		let requestId = this.idGenerator.getNextId();

		let request = new Request();
		request.requestId = requestId;
		request.recipientId = configuration.recipientId;
		request.event = configuration.event;
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

	_response(
		requestId,
		data
	) {
		let event = Connection.getEvent();

		let response = new Response();
		response.requestId = requestId;
		response.data = data;

		this.socket.emit(
			event,
			response
		);
	}

	send(
		configuration
	) {
		this._request(
			configuration
		);
	}
}
