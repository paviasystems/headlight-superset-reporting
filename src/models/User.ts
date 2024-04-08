import { Entity, Column, PrimaryGeneratedColumn, OneToMany  } from "typeorm"
import type { GithubDailyData } from "./GithubDailyData"

// @Entity("User")
export class User {
    // @PrimaryGeneratedColumn()
    ID: number

    // @Column({
    //     length: 100,
    // })
    Email: string

    // @Column({
    //     length: 100,
    // })
    Name: string

    // @Column("boolean")
    IsSenior: boolean

    // @Column("datetime")
    LastRanDate: Date

    // @Column("datetime")
    DisabledDate: Date

    // @OneToMany("GithubDailyData", (data: GithubDailyData) => data.User)
    GithubDailyData: GithubDailyData[]

    constructor(init?: Partial<User>) {
		Object.assign(this, init);
	}
}