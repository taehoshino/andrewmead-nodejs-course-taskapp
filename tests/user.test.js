const request = require("supertest")
const app = require("../src/app")
const User = require("../src/models/user")
const { userOneId, userOne, setupDatabase } = require("./fixtures/db")


beforeEach(setupDatabase)

test("Should signup a new user", async() => {
    const response = await request(app)
    .post("/users")
    .send({
        name: "Tae", 
        email: "tae@example.com", 
        password: "pass1234!!"
    }).expect(201)

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about response
    expect(response.body).toMatchObject({
        user: {
            name: "Tae", 
            email: "tae@example.com"
        }, 
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe("pass1234!")
})

test("Should not signup user with invalid email", async ()=>{
    await request(app)
    .post("/users")
    .send({
        name: "Makoto", 
        email: "example.com", 
        password: "what12345$$"
    })
    .expect(400)
})

test("Should login existing user", async () => {
    const response = await request(app)
    .post("/users/login")
    .send({
        email: userOne.email, 
        password: userOne.password    
    }).expect(200)

    // Validate new token is saved
    const user = await User.findById(response.body.user._id)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test("Should not login nonexistent user", async () => {
    await request(app).post("/users/login").
    send({
        email: userOne.email, 
        password: userOne.password + "!"
    }).expect(400)
})

test("Should get profile for user", async () => {
    await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test("Should not get profile for unauthenticated user", async () => {
    await request(app)
    .get("/users/me")
    .send()
    .expect(401)
})

test("Should delete account for user", async ()=>{
    await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test("Should not delete account for unauthenticated user", async ()=>{
    await request(app)
    .delete("/users/me")
    .send()
    .expect(401)
})

test("Should upload avatar image", async() => {
    await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/profile-pic.jpg")
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))

})

test("Should update valid user fields", async ()=>{
    await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
        name: "Andy"
    })
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toEqual("Andy")
    //toEqual <> toBe: toEqual looks at property value. toBe is equivalent to "==="
})

test("Should not update invalid user fields", async() => {
    await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
        location: "12 what"
    })
    .expect(400)
})

test("Should not update user if unauthenticated", async() => {
    await request(app)
    .patch("/users/me")
    .send({
        name: "Andy"
    })
    .expect(401)
})

test("Should not update user with invalid name/email/password", async() => {
    await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
        password: "123PASSword123!!"
    })
    .expect(400)
})
