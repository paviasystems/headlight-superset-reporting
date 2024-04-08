import { Entity, Column, PrimaryGeneratedColumn, ManyToOne  } from "typeorm"
import type { User } from "./User"

// @Entity("GithubDailyData")
// @Unique("user_day", ["UserId", "Date"])
export class GithubDailyData {
    
    // @ManyToOne("User", (user: User) => user.GithubDailyData)
    User: User

    // @Column("datetime")
    Date: Date

    // @Column("integer")
    Activity: number

    constructor(init?: Partial<GithubDailyData>) {
      Object.assign(this, init);
    }
}