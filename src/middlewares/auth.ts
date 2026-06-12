import type { Request, Response, NextFunction } from "express";

export const requiresAuth = (req: Request, res: Response, next: NextFunction) => {
    const nickUsuario = req.session?.user?.nickname;
    
    if (!nickUsuario) {
        return res.redirect('/auth/login');
    }
    
    next();
};
