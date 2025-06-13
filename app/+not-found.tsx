export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Ups!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Denne side findes ikke.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Gå til forsiden!</Text>
        </Link>
      </View>
    </>
  );
} 