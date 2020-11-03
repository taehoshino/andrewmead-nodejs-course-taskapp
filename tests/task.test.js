const request = require("supertest")
const app = require("../src/app")
const Task = require("../src/models/task")
const { 
    userOneId, 
    userOne, 
    userTwoId, 
    userTwo, 
    taskOne, 
    taskTwo, 
    taskThree,  
    setupDatabase 
} = require("./fixtures/db")

beforeEach(setupDatabase)

test("Should create task for user", async ()=>{
    const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: "From my test"
    })
    .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test("Should not create task with invalid description", async () => {
    await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
        completed: false
    })
    .expect(400)
})

test("Should fetch user tasks", async ()=>{
    const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(response.body.length).toEqual(2)
})

test("Should fetch user task by id", async() => {
    const response = await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(response.body).toMatchObject({
        description: "First task", 
        completed: false
    })
})

test("Should not fetch user task by id if unauthenticated", async()=>{
    await request(app)
    .get(`/tasks/${taskOne._id}`)
    .send()
    .expect(401)
})

test('Should not fetch other users task by id', async() => {
    await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)
})

test("Should fetch only completed tasks", async() => {
    const response = await request(app)
    .get("/tasks?completed=true")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(response.body.length).toBe(1)

    expect(response.body[0]).toMatchObject({
        description: "Second task", 
        completed: true     
    })
})

test("Should fetch only incomplete tasks", async()=>{
    const response = await request(app)
    .get("/tasks?completed=false")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(response.body.length).toBe(1)

    expect(response.body[0]).toMatchObject({
        description: "First task", 
        completed: false        
    })
})

test("Should not update task with invalid description", async()=>{
    await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({
        description: ""
    })
    .expect(400)
})

test("Should not update other users task", async()=>{
    await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send({
        completed: true
    })
    .expect(404)
})

test("Should delete user task", async ()=>{
    await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    const task = await Task.findById(taskOne._id)
    expect(task).toBeNull()
})

test("Should not delete task if unauthenticated", async()=>{
    await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .send()
    .expect(401)
})

test("Should not delete another user's task", async () => {
    await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)

    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})
