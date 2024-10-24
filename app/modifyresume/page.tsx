import { useRouter } from 'next/router';
import { prisma } from '@/lib/prisma';

export default function ModifyResume() {
  const router = useRouter();
  const { id } = router.query; // Extract the resume ID from the URL

  return (
    <div>
      <h2>Modify Resume</h2>
      <p>Modifying resume with ID: {id}</p> {/* Display the resume ID */}
    </div>
  );
}
