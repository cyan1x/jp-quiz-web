export function tailwindToClassObject(
  fixedClasses: string,
  classObject: Record<string, boolean>
) {
  // Set all fixedClasses to true
  const fixed = fixedClasses.split(" ").reduce((acc, curr) => {
    return {
      ...acc,
      [curr]: true,
    }
  }, {})

  return {
    ...fixed,
    ...classObject,
  }
}
