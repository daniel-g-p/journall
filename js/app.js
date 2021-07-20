class DomElement {
    constructor(selector, modifier, className) {
        this.element = modifier ? document.querySelector(`.${selector}--${modifier}`) : document.querySelector(`.${selector}`);
        this.className = className ? className : selector;
    }
    changeState(type = "toggle", state = "active", oldState) {
        switch (type) {
            case "toggle":
                this.element.classList.toggle(`${this.className}--${state}`);
                break;
            case "add":
                this.element.classList.add(`${this.className}--${state}`);
                break;
            case "remove":
                this.element.classList.remove(`${this.className}--${state}`);
                break;
            case "replace":
                this.element.classList.replace(`${this.className}--${oldState}`, `${this.className}--${state}`);
                break;
            default:
                return;
        }
    }
    disable(duration) {
        this.element.classList.add("disabled");
        if (duration) {
            setTimeout(() => { this.element.classList.remove("disabled") }, duration);
        }
        return;
    }
}

class DomElementGroup {
    constructor(selector, modifier, className) {
        this.elements = modifier ? document.querySelectorAll(`.${selector}--${modifier}`) : document.querySelectorAll(`.${selector}`);
        this.className = className ? className : selector;
    }
    findByModifier(modifier = "active") {
        for (let element of this.elements) {
            if (element.classList.contains(`${this.className}--${modifier}`)) { return element }
        }
    }
}

class Input extends DomElement {
    constructor(id, className, format) {
        super(className);
        this.element = document.querySelector(`#${id}`);
        this.format = format;
    }
    validate() {
        return this.value() && this.value().match(this.format) ? true : false;
    }
    value() {
        return this.element.value;
    }
}

const dom = {
    login: {
        form: new DomElement("form", "login"),
        user: new Input("user", "form__input"),
        password: new Input("password", "form__input"),
        modal: new DomElement("modal", "login-failed"),
        modalToggles: new DomElementGroup("modal__background, .modal__close, .modal__button")
    }
}

const database = {
    users: [{
        username: "daniel.gp",
        password: "Journall"
    }],
    validateLogin() {
        const user = database.users.find(user => user.username === dom.login.user.value());
        if (user && user.password === dom.login.password.value()) {
            return "Login ok"
        } else {
            dom.login.modal.changeState();
            return "Login failed";
        }
    }
}

dom.login.form.element.addEventListener("submit", (event) => {
    const validUser = dom.login.user.validate();
    const validPassword = dom.login.password.validate();
    if (!validUser || !validUser) {
        event.preventDefault();
        if (!validUser) { dom.login.user.changeState("add", "error") };
        if (!validPassword) { dom.login.password.changeState("add", "error") };
        return;
    }
    return database.validateLogin();
});

dom.login.modalToggles.elements.forEach(element => element.addEventListener("click", () => {
    dom.login.modal.changeState();
}));

[dom.login.user, dom.login.password].forEach(input => input.element.addEventListener("input", () => {
    input.changeState("remove", "error");
}))