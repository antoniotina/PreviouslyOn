<?php

namespace App\Repository;

use App\Entity\UserOrder;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method UserOrder|null find($id, $lockMode = null, $lockVersion = null)
 * @method UserOrder|null findOneBy(array $criteria, array $orderBy = null)
 * @method UserOrder[]    findAll()
 * @method UserOrder[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserOrderRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserOrder::class);
    }

    // /**
    //  * @return UserOrder[] Returns an array of UserOrder objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('u.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    //SELECT COUNT(user_id) FROM user_order WHERE user_id IS NOT NULL 


    public function countRegisteredBuyersResults()
    {
        return $this->createQueryBuilder('u')
            ->select('count(DISTINCT u.user)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function countUnregisteredBuyersResults()
    {
        $conn = $this->getEntityManager()
            ->getConnection();
        $sql = "SELECT COUNT(id) as unregistered_buyers FROM user_order WHERE user_id IS NULL";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetch();
    }


    // SELECT COUNT(id) FROM user_order WHERE user_id IS NULL

    /*
    public function findOneBySomeField($value): ?UserOrder
    {
        return $this->createQueryBuilder('u')
            ->andWhere('u.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
