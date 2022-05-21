import { inject, injectable } from 'inversify';
import { TYPES } from '../ContainerTypes';
import { IRequest, IResponse } from '../interfaces/IRequest';
import { ISubscriptionService } from '../interfaces/ISubscriptionService';
import { ILibraryController } from '../interfaces/ILibraryController';
import { ILibraryService } from '../interfaces/ILibraryService';


@injectable()
export class LibraryController implements ILibraryController {
  @inject(TYPES.LibraryService)
  private _libraryService: ILibraryService;

  public async getLibraryContentPath(req: IRequest, res: IResponse): Promise<IResponse> {
    try {
      const { relativePath } = req.query;
      const user = req.user;
      const path = `${user.email}/${relativePath ? relativePath : ''}`;
      const content = await this._libraryService.GetLibrary(user, path);
      return res.json({ content });
    } catch(err) {
      res.status(400).json({ message: err.message });
      return;
    }
  }
}
