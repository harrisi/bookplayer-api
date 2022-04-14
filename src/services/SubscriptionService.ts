import { injectable, inject } from 'inversify';
import { AppleJWT, AppleUser, RevenuecatEvent, SignApple, TypeUserParams, User, UserSession } from '../types/user';
import verifyAppleToken from 'verify-apple-id-token';
import { Knex } from 'knex';
import database from '../database';
import JWT from 'jsonwebtoken';
import { TYPES } from '../ContainerTypes';
import { IRestClientService } from '../interfaces/IRestClientService';
import { IUserService } from '../interfaces/IUserService';

@injectable()
export class SubscriptionService {
  @inject(TYPES.RestClientService)
  private _restClient: IRestClientService;
  @inject(TYPES.UserServices)
  private _user: IUserService;
  private db = database; 
  
  async ParseNewEvent(event: RevenuecatEvent): Promise<AppleUser> {
    try {
      const { original_app_user_id } = event;
      await this.db('subscription_events').insert({
        id: event.id,
        currency: event.currency,
        entitlement_id: event.entitlement_id,
        environment: event.environment,
        expiration_at_ms: event.expiration_at_ms,
        original_app_user_id: event.original_app_user_id,
        period_type: event.period_type,
        purchased_at_ms: event.purchased_at_ms,
        price: event.price,
        type: event.type,
        takehome_percentage: event.takehome_percentage,
        json: JSON.stringify(event),
      }).returning('id_subscription_event');
      
      const user = await this._user.GetUserByAppleID(original_app_user_id);
      if (!user) {
        return null;
      }
      return user;
    } catch (err) {
      console.log(err)
      return null;
    }
  }

  async GetAndUpdateSubscription( user: AppleUser ): Promise<boolean> {
    try {
      const apple_id = user[TypeUserParams.apple_id];
      const subscription = await this._restClient.callService({
        baseURL: process.env.REVENUECAT_API,
        service: `subscribers/${apple_id}`,
        method: 'get',
        headers: { authorization: `Bearer ${process.env.REVENUECAT_KEY}`}
      });
      console.log(subscription);
      return true;
    } catch(err) {
      console.log(err.message);
      return false;
    }
  }
}
