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
        return (this.value() && this.value().match(this.format)) ? true : false;
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
    },
    register: {
        form: new DomElement("form", "register"),
        email: new Input("email", "form__input", /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
        username: new Input("username", "form__input", /[A-Za-z0-9\-\_]+/),
        password: new Input("password", "form__input", /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#.?!@$%^&*-]).{8,}$/),
        confirmPassword: new Input("confirm-password", "form__input"),
        modal: new DomElement("modal", "registration-failed"),
        modalToggles: new DomElementGroup("modal__background, .modal__close, .modal__button")
    },
    reset: {
        main: new DomElement("reset-password"),
        step1: new DomElement("reset-password__step", "1"),
        step2: new DomElement("reset-password__step", "2"),
        step3: new DomElement("reset-password__step", "3"),
        modal1: new DomElement("modal", "incorrect-email"),
        modal2: new DomElement("modal", "incorrect-code"),
        modalToggles: new DomElementGroup("modal__background, .modal__close, .modal__button"),
        email: new Input("email", "form__input", /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
        resetCode: new Input("reset-code", "form__input", /^[0-9]{6}$/),
        newPassword: new Input("password", "form__input", /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#.?!@$%^&*-]).{8,}$/),
        confirmPassword: new Input("confirm-password", "form__input")
    },
    navigation: {
        container: new DomElement("container"),
        toggle: new DomElement("navigation__toggle"),
        menu: new DomElement("navigation__menu")
    }
}

const database = {
    users: [{
        email: "daniel.giustini@gmail.com",
        username: "daniel.gp",
        password: "Journall"
    }],
    findUser(userInput, userInput2) {
        userInput2 = userInput2 ? userInput2 : userInput;
        const user = database.users.find(user => {
            if (user.username === userInput || user.email === userInput2) {
                return true;
            } else {
                return false;
            }
        });
        return user;
    },
    findUserIndex(user) {
        return database.users.indexOf(user);
    },
    validateLogin() {
        const user = database.findUser(dom.login.user.value());
        if (user && user.password === dom.login.password.value()) {
            return true;
        } else {
            dom.login.modal.changeState();
            return false;
        }
    },
    validateRegistration() {
        const user = database.findUser(dom.register.username.value(), dom.register.email.value());
        if (user) {
            dom.register.modal.changeState();
            return false;
        } else {
            return true;
        }
    }
}

if (dom.login.form.element) {
    dom.login.form.element.addEventListener("submit", (event) => {
        const validUser = dom.login.user.validate();
        const validPassword = dom.login.password.validate();
        if (!validUser || !validPassword) {
            event.preventDefault();
            if (!validUser) { dom.login.user.changeState("add", "error") };
            if (!validPassword) { dom.login.password.changeState("add", "error") };
            return;
        }
        if (!database.validateLogin()) {
            event.preventDefault();
            return;
        }
        return;
    });
    dom.login.modalToggles.elements.forEach(element => element.addEventListener("click", () => {
        dom.login.modal.changeState();
    }));
    [dom.login.user, dom.login.password].forEach(input => input.element.addEventListener("input", () => {
        input.changeState("remove", "error");
    }));
}

if (dom.register.form.element) {
    dom.register.form.element.addEventListener("submit", (event) => {
        const validEmail = dom.register.email.validate();
        const validUser = (dom.register.username.validate() && dom.register.username.value().length >= 5) ? true : false;
        const validPassword = dom.register.password.validate();
        const validConfirmPassword = (dom.register.confirmPassword.validate() && dom.register.confirmPassword.value() === dom.register.password.value()) ? true : false;
        if (!validEmail || !validUser || !validPassword || !validConfirmPassword) {
            event.preventDefault();
            if (!validEmail) { dom.register.email.changeState("add", "error") };
            if (!validUser) { dom.register.username.changeState("add", "error") };
            if (!validPassword) { dom.register.password.changeState("add", "error"); };
            if (!validConfirmPassword) { dom.register.confirmPassword.changeState("add", "error") };
            return;
        }
        if (!database.validateRegistration()) {
            event.preventDefault();
            return
        }
        return;
    });
    dom.register.modalToggles.elements.forEach(element => element.addEventListener("click", () => {
        dom.register.modal.changeState();
    }));
    [dom.register.email, dom.register.username, dom.register.password, dom.register.confirmPassword].forEach(input => input.element.addEventListener("input", () => {
        input.changeState("remove", "error");
    }));
}

if (dom.reset.step1.element) {
    dom.reset.step1.element.addEventListener("submit", (event) => {
        event.preventDefault();
        const validEmail = dom.reset.email.validate();
        if (!validEmail) {
            dom.reset.email.changeState("add", "error");
            return;
        };
        const user = database.findUser(dom.reset.email.value());
        if (!user) {
            dom.reset.modal1.changeState("toggle", "active");
            return;
        }
        dom.reset.step1.changeState("replace", "exit", "active");
        dom.reset.step2.changeState();
        let randomCode = "";
        for (i = 0; i < 6; i++) {
            randomCode += Math.floor(Math.random() * 10);
        }
        user.resetCode = randomCode;
        return;
    });
    dom.reset.step2.element.addEventListener("submit", (event) => {
        event.preventDefault();
        const user = database.findUser(dom.reset.email.value());
        console.log(user);
        const requiredCode = user.resetCode;
        const validCode = dom.reset.resetCode.validate();
        if (!validCode) {
            dom.reset.resetCode.changeState("add", "error");
            return;
        }
        if (dom.reset.resetCode.value() !== requiredCode) {
            dom.reset.modal2.changeState();
            return;
        }
        dom.reset.step2.changeState("replace", "exit", "active");
        dom.reset.step3.changeState();
        return;
    });
    dom.reset.step3.element.addEventListener("submit", (event) => {
        const user = database.findUser(dom.reset.email.value());
        const validPassword = dom.reset.newPassword.validate();
        const validConfirmPassword = dom.reset.confirmPassword.value() === dom.reset.newPassword.value() ? true : false;
        if (!validPassword || !validConfirmPassword) {
            event.preventDefault();
            if (!validPassword) { dom.reset.newPassword.changeState("add", "error") };
            if (!validConfirmPassword) { dom.reset.confirmPassword.changeState("add", "error") };
            return;
        }
        user.password = dom.reset.newPassword.value();
        delete user.resetCode;
        return;
    });
    [dom.reset.email, dom.reset.resetCode, dom.reset.newPassword, dom.reset.confirmPassword].forEach(input => input.element.addEventListener("input", () => {
        input.changeState("remove", "error");
    }));
    dom.reset.modalToggles.elements.forEach(element => element.addEventListener("click", () => {
        dom.reset.modal1.changeState("remove", "active");
        dom.reset.modal2.changeState("remove", "active");
    }));
}

if (dom.navigation.toggle) {
    dom.navigation.toggle.element.addEventListener("click", () => {
        dom.navigation.toggle.changeState();
        dom.navigation.menu.changeState();
        dom.navigation.container.changeState("toggle", "fixed");
    })
}