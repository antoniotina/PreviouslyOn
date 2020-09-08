<?php

namespace App\Controller;

use App\Entity\AddressBilling;
use App\Entity\AddressShipping;
use App\Entity\Region;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\User;
use App\Repository\UserOrderRepository;
use App\Repository\UserOrderSubproductRepository;
use App\Repository\UserRepository;
use DateTime;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\HttpFoundation\Cookie;
use ReallySimpleJWT\Token;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Serializer\Exception\NotEncodableValueException;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

//Salut Victor
// require '../../vendor/autoload.php';

class UserController extends AbstractController
{
    /**
     * @Route("/register", name="register")
     */
    public function register(Request $request, UserRepository $userRepository, UserPasswordEncoderInterface $passwordEncoder)
    {
        // return new JsonResponse([...$request], 400);

        // gets the json data
        if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
            $data = json_decode($request->getContent(), true);
            $request->request->replace(is_array($data) ? $data : array());
        }
        // checks if email and password are correctly input
        if (!isset($data['email']) || !isset($data['password'])) {
            // sends error if email or password are missing
            return new JsonResponse(['msg' => 'Email or password are missing'], 400);
        } else {
            // checks if the email is already taken
            if ($userRepository->findBy(['email' => $data['email']])) {
                // sends error if the email is already in use
                return new JsonResponse(['msg' => 'Email already in use'], 401);
            } else {
                // register the user
                $user = new User();
                $user->setEmail($data['email']);
                $user->setCreatedAt(new DateTime());
                $user->setRoles(['user']);
                // $encoded = $passwordEncoder->encodePassword($user, $data['password']);
                $user->setPassword(password_hash($data['password'], PASSWORD_ARGON2I));
                $entityManager = $this->getDoctrine()->getManager();
                $entityManager->persist($user);
                $entityManager->flush();

                $token = $this->createToken($user);
                $userInRes = ['id' => $user->getId(), 'email' => $user->getEmail(), 'role' => $user->getRoles()[0]];
                return new JsonResponse(['user' => $userInRes, 'token' => $token], 200);
            }

            // return new JsonResponse(['msg' => "Incorrect email or password"], 400);
        }
    }

    /**
     * @Route("/password/reset", name="password_reset", methods="POST")
     */
    public function resetPassword(Request $request, UserRepository $userRepository, UserPasswordEncoderInterface $passwordEncoder, MailerInterface $mailer)
    {
        $jsonContent = $request->getContent();
        $req = json_decode($jsonContent);

        if (!$userRepository->findOneBy(['email' => $req->email])) {
            return new JsonResponse(['msg' => 'Email does not exist'], 404);
        } else {
            $user = $userRepository->findOneBy(['email' => $req->email]);
            $bytes = openssl_random_pseudo_bytes(6);
            $pwd = bin2hex($bytes);
            
            $user->setPassword(password_hash($pwd, PASSWORD_ARGON2I));
            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($user);
            $entityManager->flush();
        }

        $SendEmailTo = (new Email())
            ->from('8.commerce.clothing@gmail.com')
            ->to($user->getEmail())
            ->subject('Password recovery')
            ->html("This is your new password, do not forget it: " . $pwd);

        $mailer->send($SendEmailTo);
        return new JsonResponse(['message' => 'A new password was sent to your email'], 200);
    }

    /**
     * @Route("/login", name="login")
     */
    public function login(Request $request, UserRepository $userRepository, UserPasswordEncoderInterface $passwordEncoder)
    {
        // return new JsonResponse(['msg' => 'Incorrect email or password'], 400);
        // gets the json data
        if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
            $data = json_decode($request->getContent(), true);
            $request->request->replace(is_array($data) ? $data : array());
        }
        // checks if email and password are correctly input
        if (!isset($data['email']) || !isset($data['password'])) {
            // sends error if email or password are missing
            return new JsonResponse(['msg' => 'Email or password are missing'], 400);
        } else {
            if (!$userRepository->findBy(['email' => $data['email']])) {
                return new JsonResponse(['msg' => 'Incorrect email or password'], 400);
            } else {
                $user = $userRepository->findBy(['email' => $data['email']])[0];
                if (password_verify($data['password'], $user->getPassword())) {
                    $token = $this->createToken($user);
                    $userInRes = ['id' => $user->getId(), 'email' => $user->getEmail(), 'role' => $user->getRoles()[0]];
                    return new JsonResponse(['user' => $userInRes, 'token' => $token], 200);
                } else {
                    return new JsonResponse(['msg' => "Incorrect email or password"], 400);
                }
            }
        }
    }

    /**
     * @Route("/checktoken", name="checktoken")
     */
    public function checkToken(Request $request, UserRepository $userRepository, UserPasswordEncoderInterface $passwordEncoder)
    {
        if ($request->headers->get('x-auth-token')) {

            $data = $request->headers->get('x-auth-token');
            // $request->request->replace(is_array($data) ? $data : array());

            if (Token::validate($data, $_ENV["APP_SECRET"])) {

                $dataInToken = Token::getPayload($data, $_ENV["APP_SECRET"]);
                if (!$userRepository->findBy(['id' => $dataInToken['user_id']['user']])) {
                    return new JsonResponse(['msg' => 'Bad token'], 400);
                } else {
                    $user = $userRepository->findBy(['id' => $dataInToken['user_id']['user']])[0];
                    return new JsonResponse(['id' => $user->getId(), 'email' => $user->getEmail(), 'role' => $user->getRoles()[0]], 200);
                }
            }
            return new JsonResponse(['msg' => "the Bad token"], 400);
        }
    }

    /**
     * @Route("/api/user/{id}/address", name="user_address", methods="GET")
     */
    public function userAddress(Request $request, UserRepository $userRepository)
    {
        $user = $userRepository->find($request->attributes->get('id'));
        return $this->json($user, 200, [], ['groups' => 'user_address']);
    }

    /**
     * @Route("/api/user/{id}/orders/count", name="user_number_orders", methods="GET")
     */
    public function userNumberOrders(Request $request, UserRepository $userRepository)
    {
        $user = $userRepository->find($request->attributes->get('id'));
        if (!$user) return $this->json(["message" => "user not found"], 404, []);
        $nbOrder = $userRepository->countOrdersById($request->attributes->get('id'));
        return $this->json(["nbOrders" => $nbOrder], 200, []);
    }

    /**
     * @Route("/api/user/{id}/orders", name="user_orders", methods="GET")
     */
    public function userOrders(Request $request, UserRepository $userRepository, NormalizerInterface $normalizer)
    {
        $user = $userRepository->find($request->attributes->get('id'));
        if (!$user) return $this->json(["message" => "user not found"], 404, []);
        $userOrders = $normalizer->normalize($user, null, ['groups' => 'user_orders']);

        $nbOrder = $userRepository->countOrdersById($request->attributes->get('id'));
        return $this->json(array_merge(["nbOrders" => $nbOrder], $userOrders), 200, []);
    }

    /**
     * @Route("/api/user/{id}/address/shipping", name="user_shipping_address", methods="POST")
     */
    public function userShippingAddress(Request $request, SerializerInterface $serializer, ValidatorInterface $validator, EntityManagerInterface $em)
    {
        $jsonContent = $request->getContent();
        $req = json_decode($jsonContent);
        $user_id = $request->attributes->get('id');

        $user = $this->getDoctrine()->getRepository(User::class)->find($user_id);
        if (!isset($user)) return $this->json(['message' => 'user not found'], 400, []);

        if (!isset($req->region_id)) return $this->json(['message' => 'region_id missing'], 400, []);
        $region = $this->getDoctrine()->getRepository(Region::class)->find($req->region_id);
        if (!isset($region)) return $this->json(['message' => 'region not found'], 400, []);

        try {
            $shippingAddress = $serializer->deserialize($jsonContent, AddressShipping::class, 'json', [
                AbstractNormalizer::IGNORED_ATTRIBUTES => ['user', 'region']
            ]);
            $shippingAddress->setRegion($region);
            $shippingAddress->setUser($user);

            $error = $validator->validate($shippingAddress);
            if (count($error) > 0) return $this->json($error, 400);

            $em->persist($shippingAddress);
            $em->flush();

            return $this->json(['message' => 'Shipping address created', 'address' => $shippingAddress], 201, [], ['groups' => 'user_address']);
        } catch (NotEncodableValueException $e) {
            return $this->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * @Route("/api/user/{id}/address/billing", name="user_billing_address", methods="POST")
     */
    public function userBillingAddress(Request $request, SerializerInterface $serializer, ValidatorInterface $validator, EntityManagerInterface $em)
    {
        $jsonContent = $request->getContent();
        $req = json_decode($jsonContent);
        $user_id = $request->attributes->get('id');

        $user = $this->getDoctrine()->getRepository(User::class)->find($user_id);
        if (!isset($user)) return $this->json(['message' => 'user not found'], 400, []);

        if (!isset($req->region_id)) return $this->json(['message' => 'region_id missing'], 400, []);
        $region = $this->getDoctrine()->getRepository(Region::class)->find($req->region_id);
        if (!isset($region)) return $this->json(['message' => 'region not found'], 400, []);

        try {
            $billingAddress = $serializer->deserialize($jsonContent, AddressBilling::class, 'json', [
                AbstractNormalizer::IGNORED_ATTRIBUTES => ['user', 'region']
            ]);
            $billingAddress->setRegion($region);
            $billingAddress->setUser($user);

            $error = $validator->validate($billingAddress);
            if (count($error) > 0) return $this->json($error, 400);

            $em->persist($billingAddress);
            $em->flush();

            return $this->json(['message' => 'Billing address created', 'address' => $billingAddress], 201, [], ['groups' => 'user_address']);
        } catch (NotEncodableValueException $e) {
            return $this->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * @Route("/api/user/order/{trackingNb}", name="user_order_details", methods="GET")
     */
    public function userOrderDetails(Request $request, UserOrderRepository $userOrderRepository, UserOrderSubproductRepository $userOrderSubproductRepository)
    {
        $trackingNumber = $request->attributes->get('trackingNb');
        $order = $userOrderRepository->findOneBy(['trackingNumber' => $trackingNumber]);

        return $this->json($order, 200, [], ['groups' => 'user_order_details']);
    }

    private function createToken($user)
    {
        $userId = ['user' => $user->getId(), 'role' => $user->getRoles()[0]];
        $secret = $_ENV["APP_SECRET"];
        $expiration = time() + 3600 * 24;
        $issuer = '8-commerce';

        return Token::create($userId, $secret, $expiration, $issuer);
    }
}
