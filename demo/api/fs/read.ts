
async function main(): Promise<void> {
  const decoder = new TextDecoder("utf-8");
  const bytes = Deno.readFileSync("./assets/index.txt");
  const text = decoder.decode(bytes);
  console.log(text);
}

main();