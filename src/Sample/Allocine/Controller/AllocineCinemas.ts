import { Controller } from '../../../../vendor/captainscraper/framework/Controller/Controller';

/* My parsers */
import { CityListParser } from '../Parser/CityListParser';

class AllocineCinemas extends Controller {

    public execute(): void {

        let scraperModule : any = this.get('Scraper');

        /* Setting main url */
        scraperModule.param.websiteDomain = 'http://www.allocine.fr';

        /* First page to load */
        let listPageParameters: any = {
            url    : '/salle/',
            parser : CityListParser
        };

        scraperModule.addPage( listPageParameters );

    }


}

export { AllocineCinemas };