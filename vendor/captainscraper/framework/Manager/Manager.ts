/**
 * Used to manage queues
 *
 * @module   captainscraper/framework/Manager
 * @class    Manager
 *
 * @author   Nathan Lopez
 */

import { Parameters } from '../Configuration/Configuration';
import { Config } from '../Configuration/Configuration';
import { Module } from '../Module/Module';

class Manager {

    public param : any = {
        id           : '',
        maxInstance  : 10,
        frequency    : 100,
        hide         : false,
        log          : Config.logs.manager
    };

    public stopCondition: any = {
        otherCondition : null
    };

    public data: any = {
        totalExec       : 0,
        nbInstances     : 0,
        waitingElements : 0,
        owner           : null
    };

    public state: number;

    protected specificParam: any = {};
    protected atEnd: Function;
    protected main: Function;

    protected interval: any;
    protected updateWaitingElementsInterval: any;

    static statesList: Array<string> = [
        'neverStart',
        'running',
        'sleeping',
        'end'
    ];

    static existingManager: any = {};

    constructor( owner: Module, parameters: any ) {

        this.data.owner = owner;

        this.setState( 'neverStart' );

        /* Initialisation des paramètres spécifiques */

        /* Paramètre id */
        if( parameters.hasOwnProperty( 'specificParam' ) ) {
            this.specificParam = parameters.specificParam;
        }

        /* Paramètre id */
        if( parameters.hasOwnProperty( 'id' ) ) {
            this.param.id = parameters.id;

            Manager.existingManager[ this.param.id ] = this;
        } else {
            this.log( 'Manager must have an id.', 'red' );
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

    }

    /* METHODES */

    isEnd(): boolean {
        let otherCond: boolean = this.stopCondition.otherCondition( this.data.owner );

        // console.log( this.param.id + ' otherCond ' + otherCond );

        return otherCond;
    }

    start( log = true, force = false ): void {
        let self: any = this;

        if( log ) self.log( 'Launching manager ' + this.param.id );

        function exec() {
            if( this.isEnd() ) {

                if( log ) self.log( 'Manager ' + this.param.id + ' end.' );

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
    }

    clearAndRestart(): void {
        this.instanceUpdate();
        this.data.nbInstances = 0;

        clearInterval( this.interval );

        this.start( true, true );
    }

    /* GET & SET */

    setStopCondition( managers: any ): void {
        this.stopCondition.managers = managers;
    }

    getState(): string {
        return Manager.statesList[ this.state ];
    }

    setState( stateName: string ): void {
        let stateId: number = Manager.statesList.indexOf( stateName );

        if( stateId !== -1 ) {
            this.state = stateId;
        } else {
            this.log( 'State ' + stateName + ' doesn\'t exist.' );
        }
    }

    getParamMaxInstance(): number {
        return this.param.maxInstance;
    }


    getParamHide(): boolean {
        return this.param.hide;
    }

    setParamHide( bool: boolean ): void {
        this.param.hide = bool;
    }

    getDataNbInstances(): number {
        return this.data.nbInstances;
    }

    increaseDataNbInstances(): void {
        this.data.nbInstances++;
        this.instanceUpdate();
    }

    decreaseDataNbInstances(): void {
        this.data.nbInstances--;
        this.instanceUpdate();
    }

    getDataTotalExec(): number {
        return this.data.totalExec;
    }

    increaseDataTotalExec(): void {
        this.data.totalExec++;
    }

    decreaseDataTotalExec(): void {
        this.data.totalExec--;
    }

    getDataWaitingElements(): number {
        return this.data.waitingElements;
    }

    updateDataWaitingElements(): void {
    }

    increaseDataWaitingElements(): void {
        this.data.waitingElements++;
    }

    decreaseDataWaitingElements(): void {
        this.data.waitingElements--;
    }

    setAtEnd( atEnd: Function ): void {
        this.atEnd = atEnd;
    }

    instanceUpdate(): void {
        this.data.lastEndInstance = (new Date()).getTime();
    }

    /* Others */

    log( message: string, color: string = 'magenta' ): void {
        var type = this.data.owner ? this.data.owner.controller.name : '';

        if( this.param.log || color === 'red' ) console.log( '[' + type + '] ' + ( message )[color] );
    }

}

export { Manager };