export class Tutorial {
    constructor(tutorialEntries) {
        this.tutorialEntries = tutorialEntries;
        this.index = 0;
        this.currentTutorialEntry;
        this.iterator = this.getNext();
    }

    update() {
        if (!this.currentTutorialEntry) {
            this.currentTutorialEntry = this.iterator.next().value;
        } else if (this.currentTutorialEntry.isRequirementMet()) {
            this.currentTutorialEntry.complete();
            this.currentTutorialEntry = this.iterator.next().value;
        }
    }

    * getNext() {
        while (this.index < this.tutorialEntries.length) {
            this.tutorialEntries[this.index].start();
            yield this.tutorialEntries[this.index];
            this.index++;
        }
    }
}

class TutorialEntryBase {
    constructor(entryStartedCallback = () => {}, entryCompletedCallback = () => {}) {
        this.entryStartedCallback = entryStartedCallback;
        this.entryCompletedCallback = entryCompletedCallback;
    }

    start() {
        this.entryStartedCallback();
    }

    complete() {
        this.entryCompletedCallback();
    }

    isRequirementMet() {
        return false;
    }
}

export class TutorialEntry extends TutorialEntryBase {
    constructor(requirementCallback, entryStartedCallback = () => {}, entryCompletedCallback = () => {}) {
        super(entryStartedCallback, entryCompletedCallback);
        this.requirementCallback = requirementCallback;
    }

    isRequirementMet() {
        return this.requirementCallback();
    }
}

export class TimedTutorialEntry extends TutorialEntryBase {
    constructor(time, entryStartedCallback = () => {}, entryCompletedCallback = () => {}) {
        super(entryStartedCallback, entryCompletedCallback);
        this.time = time * 1000;
        this.timeout = null;
    }

    start() {
        super.start();
        this.timeout = setTimeout(() => {
            this.timeout = null;
            this.isRequirementMet = () => true;
        }, this.time);
    }

    complete() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        super.complete();
    }
}