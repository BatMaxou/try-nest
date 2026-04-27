import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class AuthAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const player = request.user;
    if (!player) {
      return false;
    }

    if (!player.admin) {
      return false;
    }

    return true;
  }
}
