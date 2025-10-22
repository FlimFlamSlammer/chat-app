import { Account } from "~/models/account";

class AccountService {
	async findByUsername(username: string) {
		return await Account.findOne({ username });
	}
}

export const accountService = new AccountService();