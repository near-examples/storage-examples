import { vector } from '../index'

function test_vector(): void {
  const value: i32 = 1

  vector.push(value)
  vector.push(1)

  assert(vector.length == 2, "Incorrect length")
  assert(vector[0] == value, "Error saving value")

  let last_element: i32 = vector.pop()
  assert(vector.length == 1, "Error popping value")

  vector[0] = 3
  assert(vector[0] == 3, "Error updating value")

}