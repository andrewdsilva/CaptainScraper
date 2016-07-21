/*
    @namespace CaptainScraper
    @module    Runner
    @author    Nathan Lopez
    @version   1.0
*/

/* CONSTRUCTEUR */

Runner = function( owner, parameters ) {

    /* INIT */

    this.param         = {
        id           : '',
        maxInstance  : 10,
        frequency    : 100,
        hide         : false
    };

    this.stopCondition = {
        otherCondition : null
    };

    this.specificParam = {};

    this.data          = {
        totalExec       : 0,
        nbInstances     : 0,
        waitingElements : 0,
        owner           : owner
    };

    this.setState( 'neverStart' );

    /* Initialisation des paramètres spécifiques */

    /* Paramètre id */
    if( parameters.hasOwnProperty( 'specificParam' ) ) {
        this.specificParam = parameters.specificParam;
    }

    /* Paramètre id */
    if( parameters.hasOwnProperty( 'id' ) ) {
        this.param.id = parameters.id;

        Runner.existingRunner[ this.param.id ] = this;
    } else {
        this.log( 'Runner must have an id.', 'red' );
    }

    /* Paramètre frequency */
    if( parameters.hasOwnProperty( 'frequency' ) ) {
        this.param.frequency = parameters.frequency;
    }

    /* Paramètre maxInstance */
    if( parameters.hasOwnProperty( 'maxInstance' ) ) {
        this.param.maxInstance = parameters.maxInstance;
    }

    /* Fonction exécuté à l'état end */
    if( parameters.hasOwnProperty( 'atEnd' ) ) {
        this.atEnd = parameters.atEnd;
    } else {
        this.atEnd = function() {};
    }

    /* Fonction principale exécuté */
    if( parameters.hasOwnProperty( 'main' ) ) {
        this.main = parameters.main;
    } else {
        this.main = function() {};
    }

    /* Fonction principale exécuté */
    if( parameters.hasOwnProperty( 'otherCondition' ) ) {
        this.stopCondition.otherCondition = parameters.otherCondition;
    } else {
        this.stopCondition.otherCondition = function() { return true; };
    }

};

/* VARIABLES STATICS */

Runner.statesList = [
    'neverStart',
    'running',
    'sleeping',
    'end'
];

Runner.existingRunner = {};

/* METHODES */

Runner.prototype.isEnd = function() {
    var otherCond  = this.stopCondition.otherCondition( this.data.owner );

    // console.log( this.param.id + ' otherCond ' + otherCond );

    return otherCond;
};

Runner.prototype.start = function( log, force ) {
    var self = this;

    if( typeof force === 'undefined' ) force = false;
    if( typeof log === 'undefined' ) log = true;

    if( log ) self.log( 'Launching runner ' + this.param.id );

    function exec() {
        if( this.isEnd() ) {

            if( log ) self.log( 'Runner ' + this.param.id + ' end.' );

            setTimeout(function() { self.setState( 'end' ); }, 2000);
            clearInterval( self.interval );
            clearInterval( self.updateWaitingElementsInterval );

            this.atEnd( self.data.owner );

        } else if( this.data.nbInstances < this.param.maxInstance ) {

            this.setState( 'running' );
            this.main( self.data.owner );

        }
    }

    function updateWaitingElements() {
        if( this.getState() === 'end' ) {

            clearInterval( this.updateWaitingElementsInterval );

        } else {

            this.updateDataWaitingElements();

        }
    }

    if( this.getState() === 'neverStart' || this.getState() === 'end' || force ) {
        this.setState( 'running' );

        this.interval = setInterval(function() {

            exec.call( self );

        }, this.param.frequency);

        this.updateWaitingElementsInterval = setInterval(function() {

            updateWaitingElements.call( self );

        }, 10 * 1000 );
    }
};

Runner.prototype.clearAndRestart = function() {
    this.instanceUpdate();
    this.data.nbInstances = 0;

    clearInterval( this.interval );

    this.start( true, true );
};

/* GET & SET */

Runner.prototype.setStopCondition = function( runners ) {
    this.stopCondition.runners = runners;
};

Runner.prototype.getState = function() {
    return Runner.statesList[ this.state ];
};

Runner.prototype.setState = function( stateName ) {
    var stateId = Runner.statesList.indexOf( stateName );

    if( stateId !== -1 ) {
        this.state = stateId;
    } else {
        this.log( 'State ' + stateName + ' doesn\'t exist.' );
    }
};

Runner.prototype.getParamMaxInstance = function() {
    return this.param.maxInstance;
};


Runner.prototype.getParamHide = function() {
    return this.param.hide;
};

Runner.prototype.setParamHide = function( boolean ) {
    this.param.hide = boolean;
};

Runner.prototype.getDataNbInstances = function() {
    return this.data.nbInstances;
};

Runner.prototype.increaseDataNbInstances = function() {
    this.data.nbInstances++;
    this.instanceUpdate();
};

Runner.prototype.decreaseDataNbInstances = function() {
    this.data.nbInstances--;
    this.instanceUpdate();
};

Runner.prototype.getDataTotalExec = function() {
    return this.data.totalExec;
};

Runner.prototype.increaseDataTotalExec = function() {
    this.data.totalExec++;
};

Runner.prototype.decreaseDataTotalExec = function() {
    this.data.totalExec--;
};

Runner.prototype.getDataWaitingElements = function() {
    return this.data.waitingElements;
};

Runner.prototype.updateDataWaitingElements = function() {
};

Runner.prototype.increaseDataWaitingElements = function() {
    this.data.waitingElements++;
};

Runner.prototype.decreaseDataWaitingElements = function() {
    this.data.waitingElements--;
};

Runner.prototype.setAtEnd = function( atEnd ) {
    this.atEnd = atEnd;
};

Runner.prototype.instanceUpdate = function() {
    this.data.lastEndInstance = (new Date()).getTime();
};

/* Others */

Runner.prototype.log = function( message, color ) {
    if( typeof color === 'undefined' ) color = 'magenta';

    if( this.data.owner.cs.param.logRunner || color === 'red' ) console.log( '[' + this.data.owner.cs.param.id + '] ' + ( message )[color] );
};