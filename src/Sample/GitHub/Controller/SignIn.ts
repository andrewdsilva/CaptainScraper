import { Controller } from '../../../../app/importer';

/* My parsers */
import { LoginParser } from '../Parser/LoginParser';

class SignIn extends Controller {

    public execute(): void {

        let scraperModule: any = this.get('Scraper');

        /* Setting main url */
        scraperModule.param.websiteDomain = 'https://github.com';

        /* Enable cookies */
        scraperModule.param.enableCookies = true;

        /* First page to load */
        let listPageParameters: any = {
            url    : '/login',
            parser : LoginParser
        };

        scraperModule.addPage( listPageParameters );

    }


}

export { SignIn };