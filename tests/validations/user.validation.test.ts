import loginValidation from '../../src/validations/user.validation';

describe('User Validation', () => {
    let req: any;
    let res: any;
    let next: jest.Mock;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        next = jest.fn();
    });

    describe('loginValidation', () => {
        it('should pass validation with valid data', () => {
            req.body = {
                wallet_address: 'sent1abc123',
                pubKey: Buffer.from('test-pubkey').toString('base64'),
                signature: {
                    pub_key: {
                        type: 'tendermint/PubKeySecp256k1',
                        value: Buffer.from('test-value').toString('base64')
                    },
                    signature: Buffer.from('test-signature').toString('base64')
                }
            };

            loginValidation(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should fail validation when wallet_address is missing', () => {
            req.body = {
                signature: {
                    pub_key: {
                        type: 'tendermint/PubKeySecp256k1',
                        value: Buffer.from('test-value').toString('base64')
                    },
                    signature: Buffer.from('test-signature').toString('base64')
                }
            };

            loginValidation(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.send).toHaveBeenCalledWith({
                message: 'Wallet address is required'
            });
            expect(next).not.toHaveBeenCalled();
        });

        it('should fail validation when pub_key is missing from signature', () => {
            req.body = {
                wallet_address: 'sent1abc123',
                signature: {
                    signature: Buffer.from('test-signature').toString('base64')
                }
            };

            loginValidation(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });

        it('should fail validation when signature is missing', () => {
            req.body = {
                wallet_address: 'sent1abc123'
            };

            loginValidation(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });

        it('should fail validation when pub_key value is not base64', () => {
            req.body = {
                wallet_address: 'sent1abc123',
                signature: {
                    pub_key: {
                        type: 'tendermint/PubKeySecp256k1',
                        value: 'not-base64!@#$'
                    },
                    signature: Buffer.from('test-signature').toString('base64')
                }
            };

            loginValidation(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(next).not.toHaveBeenCalled();
        });
    });
});
